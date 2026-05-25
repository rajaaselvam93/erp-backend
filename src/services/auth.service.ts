import prisma from "../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { ERROR_MESSAGES, USER_STATUS } from "../constants";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "";

const createUser = async (body: { name: string; email: string; password: string; role: string }) => {
  const { name, email, password, role } = body;

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) throw { statuscode: 409, message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS };

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: { name, email, password: hashedPassword, role },
    select: { id: true, name: true, email: true, role: true, status: true, created_at: true },
  });

  return user;
};

const loginUser = async (email: string, password: string) => {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw { statuscode: 401, message: ERROR_MESSAGES.INVALID_CREDENTIALS };

  if (user.status === USER_STATUS.INACTIVE) throw { statuscode: 403, message: ERROR_MESSAGES.ACCOUNT_INACTIVE };
  if (user.status === USER_STATUS.SUSPENDED) throw { statuscode: 403, message: ERROR_MESSAGES.ACCOUNT_SUSPENDED };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { statuscode: 401, message: ERROR_MESSAGES.INVALID_CREDENTIALS };

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return { userId: user.id, role: user.role, accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken: string) => {
  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_SECRET);
  } catch {
    throw { statuscode: 401, message: ERROR_MESSAGES.INVALID_TOKEN };
  }

  if (decoded.type !== "refresh") throw { statuscode: 401, message: ERROR_MESSAGES.INVALID_TOKEN_TYPE };

  const accessToken = generateAccessToken(decoded.userId);
  return { accessToken };
};

const changePassword = async (userId: number, currentPassword: string, newPassword: string) => {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw { statuscode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw { statuscode: 400, message: "Current password is incorrect" };

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.users.update({ where: { id: userId }, data: { password: hashedPassword } });

  return {};
};

const forgotPassword = async (email: string) => {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw { statuscode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };

  const resetToken = jwt.sign({ userId: user.id, type: "reset" }, ACCESS_SECRET, { expiresIn: "1h" });
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.users.update({
    where: { id: user.id },
    data: { reset_token: resetToken, reset_token_expiry: expiry },
  });

  // TODO: send reset email using nodemailer

  return { userId: user.id };
};

const resetPassword = async (token: string, newPassword: string) => {
  let decoded: any;
  try {
    decoded = jwt.verify(token, ACCESS_SECRET);
  } catch {
    throw { statuscode: 400, message: "Invalid or expired token" };
  }

  const user = await prisma.users.findUnique({ where: { id: decoded.userId } });
  if (!user || user.reset_token !== token) throw { statuscode: 400, message: "Invalid or expired token" };
  if (user.reset_token_expiry && new Date() > user.reset_token_expiry) {
    throw { statuscode: 400, message: "Reset token has expired" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.users.update({
    where: { id: user.id },
    data: { password: hashedPassword, reset_token: null, reset_token_expiry: null },
  });

  return { userId: user.id };
};

const tockenLogin = async (token: string, email: string, password: string) => {
  let decoded: any;
  try {
    decoded = jwt.verify(token, ACCESS_SECRET);
  } catch {
    throw { statuscode: 401, message: ERROR_MESSAGES.INVALID_TOKEN };
  }

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw { statuscode: 401, message: ERROR_MESSAGES.INVALID_CREDENTIALS };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { statuscode: 401, message: ERROR_MESSAGES.INVALID_CREDENTIALS };

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return { userId: user.id, role: user.role, accessToken, refreshToken };
};

export default { createUser, loginUser, refreshAccessToken, changePassword, forgotPassword, resetPassword, tockenLogin };
