"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchBotResponsesThunk, fetchBotTemplatesThunk, deleteBotResponseThunk } from "../../slices/botThunks";
import { fetchDevicesThunk } from "../../slices/deviceThunks";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import {
  Bot,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Play,
  Settings,
  MessageSquare,
  Zap,
  Users,
  Clock,
  FileText,
  Smartphone,
} from "lucide-react";
import type { BotResponse, TriggerType, ResponseType } from "../../slices/botSlice";

export default function BotPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { devices } = useAppSelector((state) => state.devices);
  const { responses, loading, error } = useAppSelector((state) => state.bot);

  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  // Fetch devices and templates when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchDevicesThunk());
      dispatch(fetchBotTemplatesThunk());
    }
  }, [user, dispatch]);

  // Fetch bot responses when device is selected
  useEffect(() => {
    if (selectedDeviceId) {
      dispatch(fetchBotResponsesThunk({ deviceId: selectedDeviceId }));
    }
  }, [selectedDeviceId, dispatch]);

  // Auto-select first device if available
  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices, selectedDeviceId]);

  const getTriggerTypeLabel = (type: TriggerType): string => {
    const labels = {
      EXACT_MATCH: "Exact Match",
      CONTAINS: "Contains",
      KEYWORD: "Keywords",
      REGEX: "Regex",
      ALWAYS: "Always",
    };
    return labels[type];
  };

  const getResponseTypeLabel = (type: ResponseType): string => {
    const labels = {
      TEXT: "Text",
      QUICK_REPLY: "Quick Reply",
      INTERACTIVE: "Interactive",
      MULTI_STEP: "Multi-Step",
      CONDITIONAL: "Conditional",
    };
    return labels[type];
  };

  const getResponseTypeIcon = (type: ResponseType) => {
    switch (type) {
      case "TEXT":
        return MessageSquare;
      case "QUICK_REPLY":
        return Zap;
      case "INTERACTIVE":
        return Settings;
      case "MULTI_STEP":
        return Users;
      case "CONDITIONAL":
        return Clock;
      default:
        return MessageSquare;
    }
  };

  const handleCreateResponse = () => {
    if (selectedDeviceId) {
      router.push(`/bot/create?deviceId=${selectedDeviceId}`);
    }
  };

  const handleEditResponse = (responseId: number) => {
    // For now, redirect to create page with the response data
    // TODO: Create a dedicated edit page
    router.push(`/bot/create?edit=${responseId}`);
  };

  const handleDeleteResponse = async (responseId: number) => {
    if (window.confirm('Are you sure you want to delete this bot response? This action cannot be undone.')) {
      try {
        await dispatch(deleteBotResponseThunk({ id: responseId })).unwrap();
        // Refresh the responses list
        if (selectedDeviceId) {
          dispatch(fetchBotResponsesThunk({ deviceId: selectedDeviceId }));
        }
      } catch (err) {
        console.error('Failed to delete bot response:', err);
      }
    }
  };

  const handleTestResponse = (responseId: number) => {
    router.push(`/bot/test/${responseId}`);
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeTab="bot" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Bot Responses</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/bot/templates')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={handleCreateResponse}
              disabled={!selectedDeviceId}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Response
            </button>
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
            <span className="ml-2 text-gray-600">Loading bot responses...</span>
          </div>
        )}

        {/* Bot Responses List */}
        {!loading && selectedDeviceId && (
          <div className="space-y-4">
            {responses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Bot Responses</h3>
                <p className="text-gray-600 mb-4">
                  Create your first automated response to get started.
                </p>
                <button
                  onClick={handleCreateResponse}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Response
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {responses.map((response) => {
                  const ResponseIcon = getResponseTypeIcon(response.responseType);
                  return (
                    <div
                      key={response.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <ResponseIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {response.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {response.isActive ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Inactive
                                </span>
                              )}
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Priority: {response.priority}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Trigger</p>
                              <p className="text-sm font-medium text-gray-900">
                                {getTriggerTypeLabel(response.triggerType)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {response.triggerValue || "Always triggers"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Response Type</p>
                              <p className="text-sm font-medium text-gray-900">
                                {getResponseTypeLabel(response.responseType)}
                              </p>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            Created: {new Date(response.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleTestResponse(response.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Test Response"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditResponse(response.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Response"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteResponse(response.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete Response"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* No Device Selected */}
        {!selectedDeviceId && !loading && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Device Selected</h3>
            <p className="text-gray-600">
              Please select a device to view and manage bot responses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
