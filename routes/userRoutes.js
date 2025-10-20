import express from 'express';
import { refreshToken, registerUser, verifyOtp } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

router.post('/verify-otp',verifyOtp);

router.post('/refresh-token',refreshToken);

router.get('/profile',authenticate,(req,res)=>{
    res.json({status:1,message:`Welcome ${req.user.email}`});
})


export default router;