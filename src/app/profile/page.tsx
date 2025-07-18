"use client";
import React, { useState } from "react";
import { useAppSelector } from "../../hooks";
import Sidebar from "../../components/Sidebar";

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // Simulate success
    setSuccess("Password updated successfully!");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar activeTab="profile" />
      <main className="flex-1 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-10">
          <h1 className="text-3xl font-bold text-green-700 mb-6">My Profile</h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Confirm new password"
              />
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 font-medium">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 font-medium">{success}</div>}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-200"
            >
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
} 