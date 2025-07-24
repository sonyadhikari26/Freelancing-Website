const nodemailer = require('nodemailer');
// const { render } = require('@react-email/render');
// const EmailVerificationTemplate = require('../emails/EmailVerificationTemplate');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Add these for Gmail
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send messages');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      return false;
    }
  }

  async sendVerificationEmail(userEmail, username, verificationToken) {
    try {
      console.log(`📧 Attempting to send verification email to: ${userEmail}`);
      
      const verificationUrl = `${process.env.CORS_ORIGIN}/verify-email?token=${verificationToken}&email=${encodeURIComponent(userEmail)}`;
      const expiryTime = '24 hours';

      // Test connection first
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Email service connection failed');
      }

      // Simple HTML template for now (React Email can be added later)
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - TalentLink</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin-bottom: 10px;">Welcome to TalentLink!</h1>
              <p style="color: #666; font-size: 16px;">Verify your email to get started</p>
            </div>
            
            <p style="color: #333; font-size: 16px;">Hi ${username},</p>
            
            <p style="color: #333; font-size: 16px;">
              Thank you for signing up for TalentLink! To complete your registration and start exploring amazing freelance opportunities, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If the button above doesn't work, you can also copy and paste the following link into your browser:
            </p>
            
            <p style="color: #007bff; font-size: 14px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px; text-align: center;">
              This verification link will expire in ${expiryTime}. If you didn't create an account with TalentLink, you can safely ignore this email.
            </p>
            
            <p style="color: #666; font-size: 12px; text-align: center;">
              Best regards,<br>
              The TalentLink Team
            </p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"TalentLink" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Verify Your Email Address - TalentLink',
        html: emailHtml,
        text: `Hi ${username},

Thank you for signing up for TalentLink! To complete your registration, please verify your email address by clicking the following link:

${verificationUrl}

This verification link will expire in 24 hours. If you didn't create an account with TalentLink, you can safely ignore this email.

Best regards,
The TalentLink Team`
      };

      console.log('📤 Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(userEmail, username) {
    try {
      const mailOptions = {
        from: `"TalentLink" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Welcome to TalentLink!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Welcome to TalentLink, ${username}!</h2>
            <p>Your email has been successfully verified. You can now access all features of TalentLink:</p>
            <ul>
              <li>Browse and purchase gigs from talented freelancers</li>
              <li>Create your own gigs if you're a seller</li>
              <li>Connect with clients and freelancers</li>
              <li>Manage your orders and communications</li>
            </ul>
            <p>Start exploring amazing opportunities on TalentLink!</p>
            <a href="${process.env.CORS_ORIGIN}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to TalentLink</a>
            <p style="margin-top: 20px; color: #666;">Best regards,<br>The TalentLink Team</p>
          </div>
        `,
        text: `Welcome to TalentLink, ${username}!

Your email has been successfully verified. You can now access all features of TalentLink.

Start exploring amazing opportunities at: ${process.env.CORS_ORIGIN}

Best regards,
The TalentLink Team`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
