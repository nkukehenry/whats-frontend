"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { sendBulkMessageThunk } from "../../../slices/messageThunks";
import { fetchDevicesThunk } from "../../../slices/deviceThunks";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import {
  Rocket,
  Smartphone,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  BarChart3,
  FileText,
  Send,
  Calendar,
  List,
  Settings,
  User,
  HelpCircle,
  LogOut,
  X
} from "lucide-react";
import { Device } from "../../../slices/deviceSlice";

export default function BulkMessagesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { devices, loading: devicesLoading } = useAppSelector((state) => state.devices);
  const { loading: messageLoading, error: messageError } = useAppSelector((state) => state.messages);
  
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [form, setForm] = useState({
    recipients: "",
    message: ""
  });
  const [recipients, setRecipients] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

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
    if (!uploadFile && recipients.length === 0) {
      alert("Please add at least one recipient or upload a file");
      return;
    }
    try {
      await dispatch(sendBulkMessageThunk({
        recipients: uploadFile ? undefined : recipients,
        message: form.message,
        deviceId: selectedDeviceId,
        file: uploadFile || undefined,
      })).unwrap();
      setForm({ recipients: "", message: "" });
      setRecipients([]);
      setUploadFile(null);
      alert("Bulk message sent successfully!");
    } catch (error: unknown) {
      console.error("Failed to send bulk message:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddRecipient = () => {
    if (form.recipients.trim()) {
      setRecipients([...recipients, form.recipients.trim()]);
      setForm({ ...form, recipients: "" });
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Optionally parse and preview recipients if CSV/TXT
      if (file.type === 'text/csv' || file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const lines = content.split('\n').map(line => line.trim()).filter(line => line);
          setRecipients(lines);
        };
        reader.readAsText(file);
      } else {
        setRecipients([]); // For Excel, let backend parse
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeTab="bulk" />

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Rocket className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Bulk Message</h1>
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

              {/* Recipients */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipients
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      name="recipients"
                      value={form.recipients}
                      onChange={handleChange}
                      placeholder="+256777245670"
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddRecipient}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* File Upload */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Upload CSV/TXT/Excel file
                      <input
                        type="file"
                        accept=".csv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-500">(one number per line or Excel column)</span>
                  </div>

                  {/* Recipients List */}
                  {recipients.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {recipients.length} recipient(s)
                        </span>
                        <button
                          type="button"
                          onClick={() => setRecipients([])}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {recipients.map((recipient, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded px-3 py-2">
                            <span className="text-sm font-mono">{recipient}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveRecipient(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                disabled={messageLoading || !selectedDeviceId || (uploadFile === null && recipients.length === 0)}
                className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {messageLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Bulk Message...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Send to {uploadFile ? uploadFile.name : recipients.length} Recipient(s)
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