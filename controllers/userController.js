
// controllers/userController.js
// Controller functions for user-related operations
// (e.g., registration, login)

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../middleware/connectDB.js';
import { sendOtpEmail } from '../utils/sendOtpEmail.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';

// Register a new user

export const registerUser = async (req, res) => {
  try {
    let { username, phoneNumber, email, password } = req.body;

    //  Check if user already exists
    db.query('SELECT * FROM Users WHERE email = ? OR phoneNumber = ?', [email, phoneNumber], async (err, results) => {
      if (err) return res.status(500).json({ status: 0, message: 'Database error' });

      if (results.length > 0) {
        const existingUser = results[0];
        if (existingUser.isVerified) {
          return res.status(400).json({ status: 0, message: 'User already registered and verified. Please login.' });
        } else {
          // User exists but not verified → send new OTP
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

          db.query(
            'UPDATE Users SET otp = ?, otpExpiry = ? WHERE id = ?',
            [otp, otpExpiry, existingUser.id],
            async (updateErr) => {
              if (updateErr) return res.status(500).json({ status: 0, message: 'Error updating OTP' });

              await sendOtpEmail(email, username, otp);
              return res.status(200).json({ status: 1, message: 'OTP resent to email. Please verify.' });
            }
          );
        }
      } else {
        //  New user → insert into DB
        let hashedPassword = await bcrypt.hash(password, 10);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

        const sql = `INSERT INTO Users (username, phoneNumber, email, password, otp, otpExpiry, isVerified)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.query(sql, [username, phoneNumber, email, hashedPassword, otp, otpExpiry, false], async (insertErr, result) => {
          if (insertErr) return res.status(500).json({ status: 0, message: 'Something went wrong' });

          await sendOtpEmail(email, username, otp);
          res.status(201).json({ status: 1, message: 'OTP sent to email. Please verify.' });
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error' });
  }
};



export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Fetch user by email
    db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ status: 0, message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(400).json({ status: 0, message: 'User not found' });
      }

      const user = results[0];

      if (user.otp !== otp) {
        return res.status(400).json({ status: 0, message: 'Invalid OTP' });
      }

      if (Date.now() > user.otpExpiry) {
        return res.status(400).json({ status: 0, message: 'OTP expired' });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const updateSql = `UPDATE Users SET isVerified = ?, otp = NULL, otpExpiry = NULL, refreshToken = ? WHERE email = ?`;

      // Mark user as verified
      db.query(
        updateSql, [true, refreshToken, email],
        (updateErr) => {
          if (updateErr) {
            console.log(updateErr);
            return res.status(500).json({ status: 0, message: 'Error updating user' });
          }
          res.status(200).json({
            status: 1, message: 'Email verified successfully', access_token: accessToken, refresh_token: refreshToken
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error' });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ status: 0, message: 'Refresh token required' });
  }

  db.query('SELECT * FROM Users WHERE refreshToken = ?', [refreshToken], (err, results) => {
    if (err) {
      return res.status(500).json({ status: 0, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(403).json({ status: 0, message: 'Invalid refresh token' });
    }

    const user = results[0];
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key';

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (verifyErr) => {
      if (verifyErr) {
        return res.status(403).json({ status: 0, message: 'Invalid or expired token' });
      }

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      db.query('UPDATE Users SET refreshToken = ? WHERE id = ?', [refreshToken, user.id], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ status: 0, message: 'Database update error' });
        }

        res.status(200).json({
          status: 1,
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        });
      });
    });
  });
}


// export const loginUser = (req, res) => {
//   // Login logic here
//   res.status(200).json({ message: 'User logged in successfully' });
// };