// controllers/authController.js

import db from '../middleware/connectDB.js';

export const googleAuth = (req, res, next) => {
  // This function just triggers Passport Google auth middleware
  next();
};

export const googleCallback = (req, res) => {
    const user = {
        name : req.user.displayName,
        email : req.user.emails[0].value,
        photo : req.user.photos[0].value
    };
    res.json({
        message : 'Login Successful',
        user : user
    })
};

export const userProfile = (req, res) => {
  if (!req.user) return res.redirect('/');
  res.send(`Welcome ${req.user.displayName}`);
};

export const logoutUser = (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
};

export const mobileLogin = async (req, res) => {
  const { email, displayName } = req.body;

  try {
    // Check if user exists in MySQL
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.json({ message: 'Login successful', user: existingUser[0] });
    }

    // Otherwise create new user
    await db.promise().query('INSERT INTO users (username, email,isVerified) VALUES (?, ?, ?)', [displayName, email, true]);

    res.json({
      message: 'New user created',
      user: { displayName, email, isVerified: true }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};