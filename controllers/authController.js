// controllers/authController.js
// controllers/authController.js

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
