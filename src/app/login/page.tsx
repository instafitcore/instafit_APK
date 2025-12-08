"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      setError("Invalid email or password");
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa] px-4">

      <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center">

        {/* Logo */}
        <img
          src="/insta.png"
          alt="Instafit Core"
          className="w-40 object-contain mb-6"
        />

        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 leading-tight">          Admin Login
        </h2>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center font-medium mb-3 bg-red-50 border border-red-200 px-3 py-2 rounded-lg w-full">
            {error}
          </p>
        )}

        {/* Inputs */}
        <div className="flex flex-col gap-4 w-full">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white border border-gray-300 
                       focus:outline-none focus:ring-2 focus:ring-[#8ed26b]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white border border-gray-300 
                       focus:outline-none focus:ring-2 focus:ring-[#8ed26b]"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-[#8ed26b] hover:bg-[#78c15d] text-white py-3 
                       rounded-lg font-semibold shadow-md transition transform hover:-translate-y-1"
          >
            Login
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Instafit Core
        </p>

        <div className="mt-2 text-gray-700 text-sm text-center">
          <p><strong>Email:</strong> admin@example.com</p>
          <p><strong>Password:</strong> admin123</p>
        </div>

      </div>
    </div>
  );
}
