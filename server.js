// server.js
// Main entry point of the application

import express from 'express';
import { connectMongoDB } from './middleware/connectDB.js';
import errorHandler from './middleware/error.js';
import logger from './middleware/logger.js';
import notFound from './middleware/notFound.js';
import { setupSession } from './middleware/passportSetup.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const PORT = process.env.PORT || 3000;
const app = express();

/// setup session and passport
setupSession(app);

/// Connect to MongoDB
connectMongoDB();

//Body parser middle ware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use(logger);

// User routes
app.use('/user', userRoutes);

// Auth routes
app.use('/auth', authRoutes);
app.get('/', (req, res) => {
  try {
    res.status(200).json({ message: 'Server is running' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
})

// Error handler
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
