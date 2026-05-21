const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger.util');

class EmailService {
  constructor() {
    this.transporter = null;
    this._init();
  }

  _init() {
    if (config.email.user && config.email.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: { user: config.email.user, pass: config.email.pass },
      });
    }
  }

  isConfigured() {
    return !!this.transporter;
  }

  async send(to, subject, html, text = '') {
    if (!this.transporter) {
      logger.warn('Email service not configured, skipping email send');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      });
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (err) {
      logger.error(`Failed to send email to ${to}:`, err);
      throw err;
    }
  }

  async sendPasswordReset(email, firstName, token) {
    const resetUrl = `${config.app.frontendUrl}/auth/reset-password?token=${token}`;
    const html = this._baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${firstName},</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    `);
    await this.send(email, 'Reset Your Evvo ERP Password', html);
  }

  async sendPasswordChanged(email, firstName) {
    const html = this._baseTemplate(`
      <h2>Password Changed</h2>
      <p>Hi ${firstName},</p>
      <p>Your password has been changed successfully.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
    `);
    await this.send(email, 'Your Password Has Been Changed', html);
  }

  async sendWelcome(email, firstName, tempPassword) {
    const loginUrl = `${config.app.frontendUrl}/auth/login`;
    const html = this._baseTemplate(`
      <h2>Welcome to Evvo ERP!</h2>
      <p>Hi ${firstName},</p>
      <p>Your account has been created. Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <a href="${loginUrl}" class="btn">Login Now</a>
      <p>Please change your password after first login.</p>
    `);
    await this.send(email, 'Welcome to Evvo ERP', html);
  }

  async sendNotification(email, title, message) {
    const html = this._baseTemplate(`
      <h2>${title}</h2>
      <p>${message}</p>
      <a href="${config.app.frontendUrl}" class="btn">Open Evvo ERP</a>
    `);
    await this.send(email, title, html);
  }

  _baseTemplate(content) {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin:0; padding:0; background:#f4f4f5; }
  .container { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,.07); }
  .header { background:#6366f1; padding:32px; text-align:center; }
  .header h1 { color:#fff; margin:0; font-size:24px; font-weight:700; }
  .body { padding:40px; color:#1e1e2e; line-height:1.7; }
  .body h2 { color:#1e1e2e; font-size:20px; margin-top:0; }
  .btn { display:inline-block; background:#6366f1; color:#fff!important; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; margin:20px 0; }
  .footer { background:#f4f4f5; padding:24px; text-align:center; font-size:13px; color:#6b7280; }
</style>
</head>
<body>
<div class="container">
  <div class="header"><h1>Evvo ERP</h1></div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Evvo ERP. All rights reserved.</p>
    <p>This is an automated email, please do not reply.</p>
  </div>
</div>
</body>
</html>`;
  }
}

module.exports = new EmailService();
