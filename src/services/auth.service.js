const crypto = require('crypto');
const userRepo = require('../repositories/user.repository');
const { RefreshToken } = require('../models');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt.util');
const emailService = require('./email.service');
const logger = require('../utils/logger.util');

class AuthService {
  async login(email, password, deviceInfo = {}, ipAddress = '') {
    const user = await userRepo.findByEmail(email.toLowerCase());

    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    if (user.status !== 'active') {
      throw Object.assign(new Error('Account is inactive or suspended'), { statusCode: 403 });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      companyId: user.companyId,
      role: user.role?.slug,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt,
    });

    // Update last login
    await userRepo.updateLastLogin(user.id, ipAddress);

    return {
      accessToken,
      refreshToken,
      user: user.toJSON(),
    };
  }

  async refreshToken(token) {
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }

    const storedToken = await RefreshToken.findOne({
      where: { token, userId: decoded.id, isRevoked: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw Object.assign(new Error('Refresh token expired or revoked'), { statusCode: 401 });
    }

    const user = await userRepo.findByIdWithRelations(decoded.id);
    if (!user || user.status !== 'active') {
      throw Object.assign(new Error('User not found or inactive'), { statusCode: 401 });
    }

    // Revoke old token
    await storedToken.update({ isRevoked: true });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      companyId: user.companyId,
      role: user.role?.slug,
    };

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(tokenPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId, refreshToken) {
    if (refreshToken) {
      await RefreshToken.update(
        { isRevoked: true },
        { where: { userId, token: refreshToken } }
      );
    } else {
      await RefreshToken.update({ isRevoked: true }, { where: { userId } });
    }
  }

  async forgotPassword(email) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      // Don't reveal user existence
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepo.setPasswordResetToken(user.id, resetToken, resetExpires);

    await emailService.sendPasswordReset(user.email, user.firstName, resetToken);

    logger.info(`Password reset requested for: ${email}`);
  }

  async resetPassword(token, newPassword) {
    const user = await userRepo.findByResetToken(token);
    if (!user) {
      throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400 });
    }

    await user.update({
      password: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    // Revoke all refresh tokens
    await RefreshToken.update({ isRevoked: true }, { where: { userId: user.id } });

    await emailService.sendPasswordChanged(user.email, user.firstName);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
    }

    await user.update({ password: newPassword });
    await RefreshToken.update({ isRevoked: true }, { where: { userId } });
  }
}

module.exports = new AuthService();
