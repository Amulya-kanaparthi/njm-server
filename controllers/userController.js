
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
      $or: [{ email }],
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



// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ status: 0, message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: 0, message: 'User not found. Please register.' });
    }

    // Check verification status
    if (!user.isVerified) {
      // Resend OTP if not verified
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      await sendOtpEmail(email, user.username, otp);

      return res.status(403).json({
        status: 0,
        message: 'Account not verified. OTP resent to your email.',
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ status: 0, message: 'Invalid password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      status: 1,
      message: 'Login successful',
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        user_id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 0, message: 'Server error' });
  }
};


// Logout User (custom access_token header)
export const logoutUser = async (req, res) => {
  try {
    // Get token from 'access_token' header instead of 'Authorization'
    const accessToken = req.headers['access_token'];

    if (!accessToken) {
      return res.status(401).json({ status: 0, message: 'Access token required' });
    }

    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_key';

    // Verify token
    jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ status: 0, message: 'Invalid or expired access token' });
      }

      // Find user by decoded token
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ status: 0, message: 'User not found' });
      }

      // Remove tokens
      user.refreshToken = null;
      user.accessToken = null; // optional if stored
      await user.save();

      res.status(200).json({
        status: 1,
        message: 'Logged out successfully.',
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ status: 0, message: 'Server error' });
  }
};
