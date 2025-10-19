// middleware/connectDB.js
import mongoose from 'mongoose';
import mysql from 'mysql2';

const mongoURL = process.env.MONGO_URL;
/// MySQL Connection
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database :', err);
        return;
    }
    console.log('Connected to database');
});


/// MongoDB Connection
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
  }
};


export default db;




