"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Reset() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Reset failed");
      alert(body.message);
      router.push("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleReset} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <input className="w-full p-2 border mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-2 border mb-3" placeholder="OTP" value={otp} onChange={e=>setOtp(e.target.value)} />
        <input className="w-full p-2 border mb-3" placeholder="New password" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Reset Password</button>
      </form>
    </div>
  );
}
