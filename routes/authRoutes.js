// routes/authRoutes.js
import express from 'express';
import { googleAuth, googleCallback, logoutUser, mobileLogin, userProfile } from '../controllers/authController.js';
import passport from '../middleware/passportSetup.js';

const router = express.Router();

// Google Authentication
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] }),
  googleAuth
);

// Google Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  googleCallback
);

// Profile Route
router.get('/profile', userProfile);

// Logout Route
router.get('/logout', logoutUser);

// Mobile Login Route
router.post('/google/mobile-login', mobileLogin);


export default router;
