import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },
  refreshToken: String,
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
  resetVerified: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);
export default User;
