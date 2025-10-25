// controllers/authController.js
// controllers/authController.js

import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Mongoose User model

// Middleware to trigger Google OAuth (Passport handles it)
export const googleAuth = (req, res, next) => {
  next();
};

// Google OAuth callback
export const googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: 'Google login failed' });
    }

    const user = {
      name: req.user.displayName,
      email: req.user.emails[0].value,
      photo: req.user.photos[0].value,
    };

    // Optionally, you can save/update user in MongoDB
    await User.findOneAndUpdate(
      { email: user.email },
      { username: user.name, photo: user.photo, isVerified: true },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Login Successful',
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// User profile page
export const userProfile = (req, res) => {
  if (!req.user) return res.redirect('/');
  res.send(`Welcome ${req.user.displayName}`);
};

// Logout user
export const logoutUser = (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
};

// Mobile login / registration
export const mobileLogin = async (req, res) => {
  const { email, displayName } = req.body;

  try {
    // Check if user exists in MongoDB
    let user = await User.findOne({ email });

    if (user) {
      return res.json({ message: 'Login successful', user });
    }

    // Otherwise create new user
    user = new User({
      username: displayName,
      email,
      isVerified: true,
    });

    await user.save();

    res.json({
      message: 'New user created',
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Refresh Token

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.headers.authorization?.split(' ')[1];
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

    // Verify token signature (ignore expiry)
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if refresh token matches DB
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '60m' }
    );

    res.json({ status: 1, message: 'Access token generated successfully', accessToken: newAccessToken });
  } catch (err) {
    console.error('Error refreshing token:', err);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};
