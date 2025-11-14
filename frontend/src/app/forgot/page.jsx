"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP + Password, 3 = Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ OTP has been sent to your email!");
        setStep(2);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("⚠️ Server error. Please try again later.");
    }
    setLoading(false);
  };

  // Step 2: Reset Password
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Password reset successful! You can now log in.");
        setStep(3);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("⚠️ Server error. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {step === 1
            ? "Forgot Password"
            : step === 2
            ? "Reset Password"
            : "Success"}
        </h1>

        {/* STEP 1 — Enter Email */}
        {step === 1 && (
          <form onSubmit={handleForgot}>
            <label className="block mb-2 text-gray-700 font-semibold">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring focus:ring-blue-200"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 — Enter OTP + New Password */}
        {step === 2 && (
          <form onSubmit={handleReset}>
            <p className="text-gray-600 mb-3 text-sm">
              We have sent an OTP to <b>{email}</b>. Please check your inbox.
            </p>

            <label className="block mb-2 text-gray-700 font-semibold">
              OTP
            </label>
            <input
              type="text"
              required
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring focus:ring-blue-200"
            />

            <label className="block mb-2 text-gray-700 font-semibold">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring focus:ring-blue-200"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* STEP 3 — Success */}
        {step === 3 && (
          <div className="text-center text-green-600 font-semibold">
            Password reset successful! ✅
            <p className="mt-2 text-gray-600">
              You can now{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                login
              </a>{" "}
              with your new password.
            </p>
          </div>
        )}

        {/* Messages */}
        {error && <p className="text-red-600 mt-3 text-center">{error}</p>}
        {message && (
          <p className="text-green-600 mt-3 text-center font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
