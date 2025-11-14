"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [email, setEmail] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const e = localStorage.getItem("authEmail");
    if (!e) router.push("/login");
    else setEmail(e);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("authEmail");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome</h2>
        <p>{email}</p>
        <button onClick={logout} className="mt-4 w-full bg-red-600 text-white py-2 rounded">Logout</button>
      </div>
    </div>
  );
}
