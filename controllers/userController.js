
// controllers/userController.js
// Controller functions for user-related operations
// (e.g., registration, login)
// controllers/userController.js
// Controller functions for user-related operations
// (e.g., registration, login)

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Mongoose User model
import { sendOtpEmail } from '../utils/sendOtpEmail.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { username, phoneNumber, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res
          .status(400)
          .json({ status: 0, message: 'User already registered and verified. Please login.' });
      } else {
        // User exists but not verified → send new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

        existingUser.otp = otp;
        existingUser.otpExpiry = otpExpiry;
        await existingUser.save();

        await sendOtpEmail(email, existingUser.username, otp);
        return res.status(200).json({ status: 1, message: 'OTP resent to email. Please verify.' });
      }
    }

    // New user → create in DB
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

    const newUser = new User({
      username,
      phoneNumber,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await newUser.save();
    await sendOtpEmail(email, username, otp);

    res.status(201).json({ status: 1, message: 'OTP sent to email. Please verify.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error' });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: 0, message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ status: 0, message: 'Invalid OTP' });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ status: 0, message: 'OTP expired' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.refreshToken = refreshToken;

    await user.save();

    res.status(200).json({
      status: 1,
      message: 'Email verified successfully',
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error' });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ status: 0, message: 'Refresh token required' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ status: 0, message: 'Invalid refresh token' });
    }

    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key';

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err) => {
      if (err) {
        return res.status(403).json({ status: 0, message: 'Invalid or expired token' });
      }

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      user.refreshToken = newRefreshToken;
      await user.save();

      res.status(200).json({
        status: 1,
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error' });
  }
};
