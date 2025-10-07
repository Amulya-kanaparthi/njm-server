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
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for NJM Songs App Registration',
      html: `
        <h3>Hi ${username || 'User'},</h3>
        <p>Thank you for registering with <b>NJM Songs App</b>!</p>
        <p>Your <b>One-Time Password (OTP)</b> for completing your registration is:</p>
        <h1 style="color: #07273cff;">${otp}</h1>
        <p><b>Important:</b></p>
        <ul>
          <li>This OTP is valid for <b>10 minutes</b>.</li>
          <li>Do not share this OTP with anyone.</li>
          <li>If you did not request this, please ignore this email.</li>
        </ul>
        <p>Steps to complete your registration:</p>
        <ol>
          <li>Open the NJM Songs App.</li>
          <li>Enter your email and the OTP.</li>
          <li>Tap <b>Verify OTP</b> to complete registration.</li>
        </ol>
        <p>We’re excited to have you on board! 🎶</p>
        <p>Best regards,<br><b>NJM Songs App Team</b></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};
