"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { sendMessageThunk } from "../../slices/messageThunks";
import { fetchDevicesThunk } from "../../slices/deviceThunks";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import {
  Send,
  Smartphone,
  Loader2,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Rocket,
  Calendar,
  List,
  Settings,
  User,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Device } from "../../slices/deviceSlice";

function MessagesContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const { devices, loading: devicesLoading } = useAppSelector((state) => state.devices);
  const { loading: messageLoading, error: messageError } = useAppSelector((state) => state.messages);
  
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [form, setForm] = useState({
    to: "",
    message: ""
  });

  // Get deviceId from URL params
  useEffect(() => {
    const deviceId = searchParams.get('deviceId');
    if (deviceId) {
      setSelectedDeviceId(parseInt(deviceId));
    }
  }, [searchParams]);

  // Fetch devices when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchDevicesThunk());
    }
  }, [user, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId) {
      alert("Please select a device");
      return;
    }

    try {
      await dispatch(sendMessageThunk({
        to: form.to,
        message: form.message,
        deviceId: selectedDeviceId
      })).unwrap();
      
      // Clear form on success
      setForm({ to: "", message: "" });
      alert("Message sent successfully!");
    } catch (error: unknown) {
      console.error("Failed to send message:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeTab="send" />

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Send className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Send Message</h1>
              
            </div>
          </div>

          

          {/* Content */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Device Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Device
                </label>
                <select
                  value={selectedDeviceId || ""}
                  onChange={(e) => setSelectedDeviceId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a device</option>
                  {devices.map((device: Device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} ({device.waNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipient Number
                </label>
                <input
                  type="tel"
                  name="to"
                  value={form.to}
                  onChange={handleChange}
                  placeholder="+256777245670"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={messageLoading || !selectedDeviceId}
                className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {messageLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>

            {/* Error Display */}
            {messageError && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">{messageError}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
} 