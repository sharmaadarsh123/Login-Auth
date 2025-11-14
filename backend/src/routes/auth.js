
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendMail } from "../config/mailer.js";

const router = express.Router();
const OTP_EXPIRE_MIN = parseInt(process.env.OTP_EXPIRE_MIN || "10", 10);

const genOTP = () => String(Math.floor(100000 + Math.random() * 900000));

router.get("/test-mail", async (req, res) => {
  try {
    await sendMail({ to: process.env.MAIL_USER, subject: "Test Mail", text: "This is test." });
    res.json({ message: "Mail sent" });
  } catch (err) {
    res.status(500).json({ error: "Mail failed", detail: err.message });
  }
});

// REGISTER save user, send OTP
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    const otpCode = genOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_MIN * 60 * 1000);
    const hashed = await bcrypt.hash(password, 10);

    if (existing) {
      // if already verified, block
      if (existing.verified) return res.status(400).json({ error: "Already registered and verified" });
      existing.name = name || existing.name;
      existing.password = hashed;
      existing.otp = { code: otpCode, expiresAt };
      existing.verified = false;
      await existing.save();
    } else {
      await User.create({
        name,
        email: email.toLowerCase(),
        password: hashed,
        otp: { code: otpCode, expiresAt },
        verified: false
      });
    }

    // send OTP
    const subject = "Verify your account - OTP";
    const text = `Hello ${name || ""},\n\nYour OTP is ${otpCode}. It expires in ${OTP_EXPIRE_MIN} minutes.`;
    await sendMail({ to: email, subject, text });

    console.log("OTP", otpCode, "sent to", email);
    return res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("REGISTER ERR", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otp) return res.status(400).json({ error: "No pending OTP" });

    if (user.otp.code !== String(otp)) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date() > new Date(user.otp.expiresAt)) return res.status(400).json({ error: "OTP expired" });

    user.verified = true;
    user.otp = null;
    await user.save();
    return res.json({ message: "Email verified" });
  } catch (err) {
    console.error("VERIFY ERR", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

// FORGOT- send reset OTP
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otpCode = genOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_MIN * 60 * 1000);
    user.otp = { code: otpCode, expiresAt };
    await user.save();

    const subject = "Password Reset OTP";
    const text = `Your password reset OTP is ${otpCode}. It expires in ${OTP_EXPIRE_MIN} minutes.`;
    await sendMail({ to: email, subject, text });

    console.log("Reset OTP", otpCode, "sent to", email);
    return res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("FORGOT ERR", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// RESET - verify otp + set new password
router.post("/reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: "Email, OTP and new password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otp) return res.status(400).json({ error: "Invalid request" });
    if (user.otp.code !== String(otp)) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date() > new Date(user.otp.expiresAt)) return res.status(400).json({ error: "OTP expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    await user.save();
    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET ERR", err);
    return res.status(500).json({ error: "Password reset failed" });
  }
});

// LOGIN -> check verified + password
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.verified) return res.status(400).json({ error: "Please verify your email first" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    return res.json({ message: "Login successful", user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("LOGIN ERR", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

export default router;
