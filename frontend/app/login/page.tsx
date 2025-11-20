"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import api from "@/utils/api";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });

      // Save tokens in localStorage
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user)); // user info like name/email

      toast.success("Login successful!");
      setTimeout(() => router.push("/task"), 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-50 to-blue-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md flex flex-col gap-6"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
          Welcome Back
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          className="bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors"
        >
          Login
        </button>

        <p className="text-center text-gray-500">
          Don&apos;t have an account?{" "}
          <span
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
            onClick={() => router.push("/register")}
          >
            Sign Up
          </span>
        </p>
      </form>
      <ToastContainer position="top-right" />
    </div>
  );
}
