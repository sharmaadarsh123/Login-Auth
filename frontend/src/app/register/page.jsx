"use client";

import { useState } from "react";
import Input from "../components/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";

const defaultData = { name: "", email: "", password: "" };

const Register = () => {
  const [data, setData] = useState(defaultData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState(null); // ✅ For backend messages
  const router = useRouter();

  //  Input change handler
  const onValueChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Frontend validation
  const validate = () => {
    const newErrors = {};

    if (!/^[A-Za-z\s]+$/.test(data.name) || data.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 letters long.";
    }

    if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        data.password
      )
    ) {
      newErrors.password =
        "Password must be 8+ chars, include upper, lower, number, and special char.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Register API call
  const onRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerMessage(null);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      // Handle backend responses clearly
      if (res.ok && result.message) {
        setServerMessage({
          type: "success",
          text: result.message || "✅ Registration successful!",
        });
        setData(defaultData);
        router.push('/verify')
      } else {
        // backend sends error, message
        setServerMessage({
          type: "error",
          text: result.error || result.message || "❌ Registration failed.",
        });
      }
    } catch (error) {
      setServerMessage({
        type: "error",
        text: "⚠️ Something went wrong while connecting to the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white px-10 pt-8 pb-12 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Register
        </h1>

        {/* Backend + validation messages */}
        {serverMessage && (
          <p
            className={`text-center mb-4 ${
              serverMessage.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {serverMessage.text}
          </p>
        )}

        {/* Frontend validation errors handled by Input component */}
        <form onSubmit={onRegister}>
          <Input
            label="Full Name"
            id="name"
            name="name"
            type="text"
            value={data.name}
            onChange={onValueChange}
            error={errors.name}
          />

          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            value={data.email}
            onChange={onValueChange}
            error={errors.email}
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            value={data.password}
            onChange={onValueChange}
            error={errors.password}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full w-full mt-4 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Register"}
          </button>

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>

          <p className="mt-2 text-center text-gray-600">
            <Link href="/forgot" className="text-blue-500 hover:underline">
              Forgot Password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
