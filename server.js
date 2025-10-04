// server.js
// Main entry point of the application

import express from 'express';
import errorHandler from './middleware/error.js';
import logger from './middleware/logger.js';
import notFound from './middleware/notFound.js';
import userRoutes from './routes/userRoutes.js';

const PORT = process.env.PORT || 3000;

const app = express();


//Body parser middle ware
app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Logger middleware
app.use(logger);

// User routes
app.use('/user', userRoutes);

// Error handler
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
