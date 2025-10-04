// middleware/connectDB.js
import mysql from 'mysql2';

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

export default db;




