"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

export default function DashboardPage() {
  const [refresh, setRefresh] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    if (!auth) router.push("/login");
  }, [router]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
        Task Dashboard
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <TaskForm onSuccess={() => setRefresh(!refresh)} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <TaskList key={refresh ? 1 : 0} />
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
}
