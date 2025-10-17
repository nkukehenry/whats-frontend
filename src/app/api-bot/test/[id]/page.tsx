"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import Sidebar from "../../../../components/Sidebar";
import { testApiBotConfigThunk } from "../../../../slices/apiBotThunks";
import { clearTestResult } from "../../../../slices/apiBotSlice";
import { 
  Code, 
  Play, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Copy,
  RefreshCw,
} from "lucide-react";

export default function ApiBotTestPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const { testing, testResult, error } = useAppSelector((state) => state.apiBot);

  const configId = parseInt(params.id as string);
  const [testMessage, setTestMessage] = useState("Hello, test message");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearTestResult());
    };
  }, [dispatch]);

  const handleTest = async () => {
    if (!testMessage.trim()) return;

    try {
      await dispatch(testApiBotConfigThunk({
        id: configId,
        testData: { testMessage }
      })).unwrap();
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  const handleCopyResult = async () => {
    if (testResult?.data?.response?.reply) {
      try {
        await navigator.clipboard.writeText(testResult.data.response.reply);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="api-bot" />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Code className="w-7 h-7 text-green-600" />
                  Test API Bot Configuration
                </h1>
                <p className="text-gray-600 mt-1">
                  Test your API bot configuration with a sample message
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Test Input */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Message
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter a test message that will trigger your API bot..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    rows={3}
                  />
                </div>

                <button
                  onClick={handleTest}
                  disabled={testing || !testMessage.trim()}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {testing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {testing ? 'Testing...' : 'Run Test'}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Test Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Test Results */}
            {testResult && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Test Results
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyResult}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => dispatch(clearTestResult())}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Clear
                    </button>
                  </div>
                </div>

                {testResult.success ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-green-800 mb-2">Success</h3>
                      <p className="text-sm text-green-700">
                        The API call was successful and returned a response.
                      </p>
                    </div>

                    {testResult.data.response.reply && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Bot Response</h4>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-gray-900 whitespace-pre-wrap">
                            {testResult.data.response.reply}
                          </p>
                        </div>
                      </div>
                    )}

                    {testResult.data.response.media && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Media URL</h4>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <a
                            href={testResult.data.response.media}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 break-all"
                          >
                            {testResult.data.response.media}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-800 mb-2">Test Failed</h3>
                    <p className="text-sm text-red-700">
                      The API call failed or returned an error.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">How Testing Works</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your test message will be sent to the configured API endpoint</li>
                <li>• The API response will be processed and returned as a bot reply</li>
                <li>• Use this to verify your API integration is working correctly</li>
                <li>• Test different message formats to ensure proper handling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

