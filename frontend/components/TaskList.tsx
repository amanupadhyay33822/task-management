"use client";

import { useQuery, useMutation } from "react-query";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TaskForm from "./TaskForm";
import { toast } from "react-toastify";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
}

export default function TaskList() {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTasks = async () => {
    const params: any = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    const res = await api.get("/tasks", { params });
    return res.data.data;
  };

  const { data: tasks, refetch } = useQuery<Task[]>(
    ["tasks", search, statusFilter],
    fetchTasks
  );

  const toggleStatus = useMutation(
    async (id: number) => await api.post(`/tasks/${id}/toggle`),
    {
      onSuccess: () => {
        toast.success("Status updated");
        refetch();
      },
    }
  );

  const deleteTask = useMutation(
    async (id: number) => await api.delete(`/tasks/${id}`),
    {
      onSuccess: () => {
        toast.success("Task deleted");
        refetch();
      },
    }
  );

  // LOGOUT HANDLER
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    toast.success("Logged out");
    router.push("/login");
  };

  // RESET FILTERS
  const handleReset = () => {
    setSearch("");
    setStatusFilter("");
    refetch();
  };

  return (
    <div className="p-6">
      {/* NAVBAR */}
      <div className="bg-white shadow-md p-4 rounded-xl flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700">Task Dashboard</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Task
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white shadow-sm mt-6 p-4 rounded-xl flex items-center gap-4">
        <input
          placeholder="Search by task title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-md w-1/3 focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        <button
          onClick={() => refetch()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Apply
        </button>

        <button
          onClick={handleReset}
          className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
        >
          Reset
        </button>
      </div>

      {/* TASK TABLE */}
      <div className="bg-white mt-6 p-6 rounded-xl shadow-md overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b">Title</th>
              <th className="p-3 border-b">Description</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {tasks?.map((task) => (
              <tr key={task.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold">{task.title}</td>
                <td className="p-3 text-gray-600">{task.description}</td>
                <td className="p-3">{task.status}</td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleStatus.mutate(task.id)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg mr-2"
                  >
                    Toggle
                  </button>

                  <button
                    onClick={() => deleteTask.mutate(task.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {tasks?.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between mb-3">
              <h2 className="text-xl font-bold">Add Task</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-red-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <TaskForm
              onSuccess={() => {
                refetch();
                setIsModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
