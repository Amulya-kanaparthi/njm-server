
// controllers/userController.js
// Controller functions for user-related operations
// (e.g., registration, login)

import bcrypt from 'bcrypt';
import db from '../middleware/connectDB.js';


// Register a new user
export const registerUser = async (req, res) => {

    try {
       let { username, phoneNumber, email, password } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10)

    console.log("After receiving data : ", username, phoneNumber, email, password, hashedPassword);

    db.query('INSERT INTO Users(username,phoneNumber,email,password)values(?,?,?,?)',[username, phoneNumber, email, hashedPassword],
        (error, result) => {
            if (error) {
                console.log('This is the error', error)
                return res.status(500).json("Something went wrong");
            }
            console.log('This is the body', req.body)
            res.status(201).json({message: 'User registered successfully' });
        }) 
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }

};

// export const loginUser = (req, res) => {
//   // Login logic here
//   res.status(200).json({ message: 'User logged in successfully' });
// };