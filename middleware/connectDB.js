// middleware/connectDB.js
import mongoose from 'mongoose';
// import mysql from 'mysql2';

// const mongoURL = process.env.MONGO_URL;
// /// MySQL Connection
// const db = mysql.createConnection({
//     host: process.env.MYSQLHOST,
//     user: process.env.MYSQLUSER,
//     password: process.env.MYSQLPASSWORD,
//     database: process.env.MYSQLDATABASE,
// });

// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to database :', err);
//         return;
//     }
//     console.log('Connected to database');
// });

// export default db;
const mongoUri = process.env.MONGO_URI;
/// MongoDB Connection
export const connectMongoDB = async () => {
  mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch(err => console.error('MongoDB connection error:', err));
};






