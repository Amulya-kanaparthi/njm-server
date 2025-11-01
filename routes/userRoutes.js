import express from 'express';
import { checkResetStatus, forgotPassword, loginUser, logoutUser, registerUser, resetPassword, verifyOtp, verifyResetToken } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

router.post('/verify-otp',verifyOtp);

router.post('/login',loginUser);

router.post('/logout',logoutUser);

router.post('/forgot-password',forgotPassword);

router.get('/verify-reset/:token', verifyResetToken);

router.post('/check-authentication', checkResetStatus);

router.post('/reset-password', resetPassword);

router.get('/profile',authenticate,(req,res)=>{
    res.json({status:1,message:`Welcome ${req.user.email}`});
})


export default router;