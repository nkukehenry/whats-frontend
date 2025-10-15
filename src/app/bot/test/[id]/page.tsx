"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { testBotResponseThunk, fetchBotResponsesThunk } from "../../../../slices/botThunks";
import { fetchDevicesThunk } from "../../../../slices/deviceThunks";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../../components/Sidebar";
import TestResultRenderer from "../../../../components/TestResultRenderer";
import {
  Bot,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  Copy,
  RefreshCw,
} from "lucide-react";
import type { BotResponse, BotTestResult } from "../../../../slices/botSlice";

export default function TestBotResponsePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const { user } = useAppSelector((state) => state.auth);
  const { devices } = useAppSelector((state) => state.devices);
  const { responses, testing, testResult, error } = useAppSelector((state) => state.bot);

  const [selectedResponse, setSelectedResponse] = useState<BotResponse | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  const responseId = params.id ? parseInt(params.id as string) : null;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

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

  // Fetch bot responses when device is selected
  useEffect(() => {
    if (selectedDeviceId) {
      dispatch(fetchBotResponsesThunk({ deviceId: selectedDeviceId }));
    }
  }, [selectedDeviceId, dispatch]);

  // Find the response to test
  useEffect(() => {
    if (responseId && responses.length > 0) {
      const response = responses.find(r => r.id === responseId);
      if (response) {
        setSelectedResponse(response);
        // Set default test message based on trigger
        if (response.triggerType === 'KEYWORD' && response.triggerValue) {
          const keywords = response.triggerValue.split(',').map(k => k.trim());
          setTestMessage(keywords[0] || '');
        } else if (response.triggerType === 'EXACT_MATCH') {
          setTestMessage(response.triggerValue || '');
        } else if (response.triggerType === 'CONTAINS') {
          setTestMessage(`Test message with ${response.triggerValue}`);
        }
      }
    }
  }, [responseId, responses]);

  const handleTest = async () => {
    if (!selectedResponse || !selectedDeviceId || !testMessage.trim() || !contactNumber.trim()) {
      return;
    }

    try {
      await dispatch(testBotResponseThunk({
        deviceId: selectedDeviceId,
        message: testMessage,
        contactNumber: contactNumber,
      })).unwrap();
    } catch (err) {
      console.error('Failed to test bot response:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTriggerTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      EXACT_MATCH: "Exact Match",
      CONTAINS: "Contains",
      KEYWORD: "Keywords",
      REGEX: "Regex",
      ALWAYS: "Always",
    };
    return labels[type] || type;
  };

  const getResponseTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      TEXT: "Text",
      QUICK_REPLY: "Quick Reply",
      INTERACTIVE: "Interactive",
      MULTI_STEP: "Multi-Step",
      CONDITIONAL: "Conditional",
    };
    return labels[type] || type;
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
            <h1 className="text-2xl font-bold text-gray-900">Test Bot Response</h1>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Test Configuration */}
          <div className="space-y-6">
            {/* Device Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device
                  </label>
                  <select
                    value={selectedDeviceId || ""}
                    onChange={(e) => setSelectedDeviceId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Choose a device...</option>
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name} ({device.waNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Message
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter the message to test..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g., 254712345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <button
                  onClick={handleTest}
                  disabled={testing || !selectedDeviceId || !testMessage.trim() || !contactNumber.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Test Response
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Response Details */}
            {selectedResponse && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{selectedResponse.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Trigger</p>
                    <p className="font-medium text-gray-900">
                      {getTriggerTypeLabel(selectedResponse.triggerType)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedResponse.triggerValue || "Always triggers"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Response Type</p>
                    <p className="font-medium text-gray-900">
                      {getResponseTypeLabel(selectedResponse.responseType)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <p className="font-medium text-gray-900">{selectedResponse.priority}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedResponse.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedResponse.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Test Results */}
          <div className="space-y-6">
            {/* Test Results */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>

              {testResult ? (
                <TestResultRenderer 
                  testResult={testResult} 
                  onCopyResult={(text) => copyToClipboard(text)}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                  <p>No test results yet</p>
                  <p className="text-sm">Run a test to see the response</p>
                </div>
              )}
            </div>

            {/* Test Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-medium text-blue-900 mb-2">Testing Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use exact trigger text for EXACT_MATCH tests</li>
                <li>• Include trigger keywords for KEYWORD tests</li>
                <li>• Test with different message formats</li>
                <li>• Check priority order if multiple responses match</li>
                <li>• Verify response formatting and content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
