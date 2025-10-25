// middleware/connectDB.js
import mongoose from 'mongoose';

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






