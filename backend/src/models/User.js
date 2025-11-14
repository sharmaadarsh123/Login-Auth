
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  code: String,
  expiresAt: Date
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, 
  verified: { type: Boolean, default: false },
  otp: { type: otpSchema, default: null }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
