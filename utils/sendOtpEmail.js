// utils/sendOtpEmail.js
import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends OTP email to the user via Resend API
 * @param {string} email - Recipient email address
 * @param {string} username - Recipient username (optional)
 * @param {string} otp - OTP to send
 */
export const sendOtpEmail = async (email, username, otp) => {
  try {
    await resend.emails.send({
      from: 'NJM Songs <onboarding@resend.dev>', // can customize after domain verification
      to: email,
      subject: 'Your OTP for NJM Songs App Registration',
      html: `
        <h3>Hi ${username || 'User'},</h3>
        <p>Thank you for registering with <b>NJM Songs App</b>!</p>
        <p>Your <b>One-Time Password (OTP)</b> is:</p>
        <h1 style="color: #07273cff;">${otp}</h1>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        <p>Best regards,<br><b>NJM Songs App Team</b></p>
      `,
    });

    console.log(`✅ OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error('❌ Error sending OTP email via Resend:', error);
    throw new Error('Failed to send OTP email');
  }
};
