
// controllers/userController.js
// Controller functions for user-related operations
// (e.g., registration, login)

import bcrypt from 'bcrypt';
import db from '../middleware/connectDB.js';
import { sendOtpEmail } from '../utils/sendOtpEmail.js';

// Register a new user
export const registerUser = async (req, res) => {
  try {
    let { username, phoneNumber, email, password } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

    const sql = `INSERT INTO Users (username, phoneNumber, email, password, otp, otpExpiry, isVerified)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [username, phoneNumber, email, hashedPassword, otp, otpExpiry, false], async (error, result) => {
      if (error) return res.status(500).json({ message: 'Something went wrong' });

      // Send OTP email using the new function
      await sendOtpEmail(email, username, otp);

      res.status(201).json({ message: 'OTP sent to email. Please verify.' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Fetch user by email
    db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }

      const user = results[0];

      if (user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      if (Date.now() > user.otpExpiry) {
        return res.status(400).json({ message: 'OTP expired' });
      }

      // Mark user as verified
      db.query(
        'UPDATE Users SET isVerified = ?, otp = NULL, otpExpiry = NULL WHERE email = ?',
        [true, email],
        (updateErr) => {
          if (updateErr) {
            console.log(updateErr);
            return res.status(500).json({ message: 'Error updating user' });
          }
          res.status(200).json({ message: 'Email verified successfully' });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// export const loginUser = (req, res) => {
//   // Login logic here
//   res.status(200).json({ message: 'User logged in successfully' });
// };