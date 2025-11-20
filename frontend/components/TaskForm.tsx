"use client";

import { useState } from "react";
import api from "@/utils/api";
import { toast } from "react-toastify";

export default function TaskForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/tasks", { title, description });
      toast.success("Task created");
      setTitle("");
      setDescription("");
      onSuccess();
    } catch {
      toast.error("Error adding task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Task Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
      >
        Add Task
      </button>
    </form>
  );
}
