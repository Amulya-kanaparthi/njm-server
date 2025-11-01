import nodemailer from 'nodemailer';

/**
 * Sends OTP email to the user
 * @param {string} email - Recipient email address
 * @param {string} username - Recipient username (optional)
 * @param {string} otp - OTP to send
 */
export const sendOtpEmail = async (email, username, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"NJM Songs App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code for NJM Songs App',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8f9fb; padding: 40px 0;">
          <div style="max-width: 500px; background-color: #ffffff; margin: auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
            <div style="padding: 30px;">
              <h2 style="font-size: 24px; color: #07273c; text-align: center; margin-bottom: 30px;">NJM Songs App</h2>
              <p style="font-size: 16px; color: #333;">Hi ${username || 'User'},</p>
              <p style="font-size: 16px; color: #333;">Use the code below to verify your email for <b>NJM Songs App</b> registration.</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f2f2f2; display: inline-block; padding: 15px 30px; border-radius: 4px;">
                  <span style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #000;">${otp}</span>
                </div>
              </div>
              <p style="font-size: 15px; color: #555;">This code expires in <b>10 minutes</b>.</p>
              <p style="font-size: 14px; color: #555;">Didn’t request this code? Please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
              <p style="font-size: 13px; color: #777; text-align: center;">
                Delivered by NJM Songs App<br>
                © ${new Date().getFullYear()} NJM Songs. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};


/**
 * Sends password reset email with hyperlink.
 * @param {string} email - User email
 * @param {string} username - User name
 * @param {string} resetLink - URL with token
 */
export const sendResetPasswordEmail = async (email, username, resetLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f8fa;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px;">
            <h2 style="color: #333;">Hi ${username || 'User'},</h2>
            <p style="color: #555;">
              We received a request to reset your password.
              Click the link below to authenticate and reset it:
            </p>
            <a href="${resetLink}" style="
                display: inline-block;
                color: #0066cc;
                text-decoration: underline;
                font-weight: bold;
                margin: 15px 0;
              ">Authenticate</a>
            <p style="color: #777; font-size: 13px;">
              This link will expire in 15 minutes.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending reset email:', error);
    throw new Error('Error sending reset email');
  }
};
