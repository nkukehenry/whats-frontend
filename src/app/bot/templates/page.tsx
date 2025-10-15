"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { fetchBotTemplatesThunk } from "../../../slices/botThunks";
import { fetchDevicesThunk } from "../../../slices/deviceThunks";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import BotTemplates from "../../../components/BotTemplates";
import { Bot, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function BotTemplatesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { templates, loading, error } = useAppSelector((state) => state.bot);
  const { devices } = useAppSelector((state) => state.devices);
  
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  // Fetch templates and devices when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchBotTemplatesThunk());
      dispatch(fetchDevicesThunk());
    }
  }, [user, dispatch]);

  // Auto-select first device if available
  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices, selectedDeviceId]);

  const handleUseTemplate = (template: { name: string; triggerType: string; triggerValue: string; responseType: string; responseData: unknown }) => {
    if (!selectedDeviceId) {
      alert('Please select a device first');
      return;
    }
    
    // Navigate to create page with template data and device ID
    const templateData = encodeURIComponent(JSON.stringify(template));
    router.push(`/bot/create?deviceId=${selectedDeviceId}&template=${templateData}`);
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="bot" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/bot')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Bot className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Bot Response Templates</h1>
          </div>
        </div>

        {/* Device Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Device
          </label>
          <select
            value={selectedDeviceId || ""}
            onChange={(e) => setSelectedDeviceId(Number(e.target.value))}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Choose a device...</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.waNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading templates...</span>
          </div>
        )}

        {/* Templates */}
        {!loading && (
        <BotTemplates
          templates={templates}
          onUseTemplate={handleUseTemplate}
          isLoading={loading}
          selectedDeviceId={selectedDeviceId}
        />
        )}
      </div>
    </div>
  );
}
