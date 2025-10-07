import express from 'express';
import { registerUser, verifyOtp } from '../controllers/userController.js';
const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

router.post('/verify-otp',verifyOtp);


export default router;