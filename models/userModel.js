import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },
  refreshToken: String,
});

const User = mongoose.model('User', userSchema);
export default User;
