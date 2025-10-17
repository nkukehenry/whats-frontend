"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../hooks";
import Sidebar from "../../components/Sidebar";
import { 
  fetchApiBotConfigsThunk, 
  deleteApiBotConfigThunk 
} from "../../slices/apiBotThunks";
import { fetchDevicesThunk } from "../../slices/deviceThunks";
import { clearError } from "../../slices/apiBotSlice";
import type { ApiBotConfig } from "../../types/apiBot";
import {
  Code,
  Plus,
  Settings,
  Trash2,
  Edit,
  Smartphone,
  Play,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ApiBotPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { devices } = useAppSelector((state) => state.devices);
  const { configs, loading, error, deleting } = useAppSelector((state) => state.apiBot);

  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  // Fetch devices when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchDevicesThunk());
    }
  }, [user, dispatch]);

  // Auto-select first device if available
  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices, selectedDeviceId]);

  // Fetch API bot configs when device is selected
  useEffect(() => {
    if (selectedDeviceId) {
      dispatch(fetchApiBotConfigsThunk({ deviceId: selectedDeviceId }));
    }
  }, [selectedDeviceId, dispatch]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleDeleteConfig = async (configId: number) => {
    if (window.confirm('Are you sure you want to delete this API bot configuration?')) {
      try {
        await dispatch(deleteApiBotConfigThunk({ id: configId })).unwrap();
        // Refresh the list
        if (selectedDeviceId) {
          dispatch(fetchApiBotConfigsThunk({ deviceId: selectedDeviceId }));
        }
      } catch (err) {
        console.error('Failed to delete API bot config:', err);
      }
    }
  };

  const handleEditConfig = (configId: number) => {
    router.push(`/api-bot/create?edit=${configId}`);
  };

  const handleTestConfig = (configId: number) => {
    router.push(`/api-bot/test/${configId}`);
  };

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="api-bot" />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Code className="w-7 h-7 text-green-600" />
                API Bot Management
              </h1>
              <p className="text-gray-600 mt-1">
                Configure bots that trigger on specific text and call external APIs
              </p>
            </div>
            <button
              onClick={() => router.push('/api-bot/create')}
              disabled={!selectedDeviceId}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create API Bot
            </button>
          </div>
        </div>

        <div className="flex-1 p-6">
          {/* Device Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Device
            </label>
            <select
              value={selectedDeviceId || ''}
              onChange={(e) => setSelectedDeviceId(Number(e.target.value))}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={devices.length === 0}
            >
              <option value="">
                {devices.length === 0 ? 'No devices available' : 'Choose a device...'}
              </option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.waNumber})
                </option>
              ))}
            </select>
            {devices.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No devices found. Please add a device first from the &quot;My Devices&quot; section.
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Content */}
          {devices.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Devices Available</h3>
              <p className="text-gray-600 mb-6">
                You need to add a WhatsApp device before you can configure API bots. 
                Go to the &quot;My Devices&quot; section to add your first device.
              </p>
              <button
                onClick={() => router.push('/devices')}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                Go to My Devices
              </button>
            </div>
          ) : !selectedDeviceId ? (
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Device Selected</h3>
              <p className="text-gray-600 mb-6">
                Please select a device from the dropdown above to view and manage API bot configurations.
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading API bot configurations...</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-12">
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API Bots Found</h3>
              <p className="text-gray-600 mb-6">
                Create your first API bot configuration to get started.
              </p>
              <button
                onClick={() => router.push('/api-bot/create')}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create API Bot
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  API Bot Configurations for {selectedDevice?.name}
                </h2>
                <span className="text-sm text-gray-600">
                  {configs.length} configuration{configs.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-4">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {config.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            config.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {config.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Trigger:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {config.triggerText}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Endpoint:</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {config.httpMethod} {config.apiEndpoint}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Timeout:</span>
                            <span>{config.timeout}ms</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleTestConfig(config.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Test Configuration"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditConfig(config.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Edit Configuration"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(config.id)}
                          disabled={deleting}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Configuration"
                        >
                          {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
