"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { addDeviceThunk, fetchDevicesThunk, fetchDeviceStatusThunk } from "../../../slices/deviceThunks";
import { selectDeviceStatus } from "../../../slices/deviceSlice";
import { logout } from "../../../slices/authSlice";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import {
  Smartphone,
  Loader2,
  CheckCircle,
  AlertCircle,
  QrCode,
  Copy,
  Info,
  Phone,
  Tag,
  HelpCircle,
  Wifi,
  RefreshCw,
} from "lucide-react";
import { DeviceStatusIndicator } from "../../../components/DeviceStatusIndicator";

type ResultType = {
  deviceId: number;
  qrCodeData: string;
  qrCodeDataUrl?: string;
  qrCodeUrl?: string;
  isActive: boolean;
  status?: string;
};

export default function AddDevicePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  
  const [form, setForm] = useState({ name: "", waNumber: "" });
  const [result, setResult] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "qr" | "success">("form");
  const [copied, setCopied] = useState(false);

  // Redux device status
  const deviceStatus = useAppSelector((state) =>
    result?.deviceId ? selectDeviceStatus(state, result.deviceId) : undefined
  );

  // Poll device status using thunk
  useEffect(() => {
    if (result?.deviceId) {
      const pollStatus = () => {
        dispatch(fetchDeviceStatusThunk({ deviceId: result.deviceId }));
      };
      const interval = setInterval(pollStatus, 5000);
      pollStatus();
      return () => clearInterval(interval);
    }
  }, [result?.deviceId, dispatch]);

  const handleBackToDevices = useCallback(() => {
    dispatch(fetchDevicesThunk()); // Refresh devices list
    router.push("/devices");
  }, [dispatch, router]);

  // Retry logic
  const handleRetryQr = () => {
    if (result?.deviceId) {
      dispatch(fetchDeviceStatusThunk({ deviceId: result.deviceId }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null); // Clear error when user types
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Device name is required");
      return false;
    }
    if (!form.waNumber.trim()) {
      setError("WhatsApp number is required");
      return false;
    }
    // Basic phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(form.waNumber.trim())) {
      setError("Please enter a valid WhatsApp number (e.g., +256777245670)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await dispatch(addDeviceThunk(form)).unwrap();
      // Map API response to ResultType
      setResult({
        deviceId: data.id, // Use 'id' from Device
        qrCodeData: data.qr ?? '',
        qrCodeDataUrl: data.qrDataUrl,
        qrCodeUrl: data.qrCodeUrl,
        isActive: data.isActive,
        status: data.status,
      });
      setStep("qr");
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message?: string }).message || "Failed to add device");
      } else {
        setError("Failed to add device");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQR = async () => {
    if (result?.qrCodeData) {
      try {
        await navigator.clipboard.writeText(result.qrCodeData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy QR code");
      }
    }
  };

  const handleReconnectDevice = () => {
    if (result?.deviceId) {
      // This part of the logic needs to be re-evaluated for HTTP polling
      // For now, we'll just show a message, as the polling effect handles updates
      // setConnectionProgress("Attempting to reconnect device...");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  const handleAddAnother = () => {
    setForm({ name: "", waNumber: "" });
    setResult(null);
    setError(null);
    setStep("form");
  };

  if (!token) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeTab="devices" 
        showBackButton={true}
        backButtonText="Back to Devices"
        onBackClick={handleBackToDevices}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Add WhatsApp Device</h1>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto">
            {step === "form" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your WhatsApp</h2>
                  <p className="text-gray-600">Enter your device details to generate a QR code for pairing</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Device Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="e.g., My iPhone, Work Phone"
                      value={form.name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Give your device a memorable name</p>
                  </div>

                  <div>
                    <label htmlFor="waNumber" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      WhatsApp Number
                    </label>
                    <input
                      id="waNumber"
                      name="waNumber"
                      type="tel"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="+256777245670"
                      value={form.waNumber}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter your WhatsApp number with country code</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-700 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding Device...
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-5 h-5" />
                        Generate QR Code
                      </>
                    )}
                  </button>
                </form>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">How it works</h4>
                      <p className="text-sm text-blue-700">
                        We&apos;ll generate a QR code that you can scan with your WhatsApp mobile app to connect this device.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === "qr" && result && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan QR Code</h2>
                  <p className="text-gray-600">Open WhatsApp on your phone and scan this code</p>
                  
                  {/* WebSocket Connection Status */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <DeviceStatusIndicator deviceId={result.deviceId} />
                  </div>

                  {/* QR Timer */}
                  {/* Removed QR Timer display */}
                  {/* Removed QR Expired display */}
                </div>

                {/* Real-time Connection Progress */}
                {/* Removed connectionProgress display */}

                {/* Retry Button */}
                {/* Removed Retry Button */}

                <div className="flex flex-col items-center space-y-6">
                  {/* QR Code */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                    {deviceStatus?.qrDataUrl ? (
                      <img
                        src={deviceStatus.qrDataUrl}
                        alt="WhatsApp QR Code"
                        className="w-64 h-64 rounded-lg"
                      />
                    ) : deviceStatus?.qr ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(deviceStatus.qr)}&size=256x256`}
                        alt="WhatsApp QR Code"
                        className="w-64 h-64 rounded-lg"
                      />
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg border border-dashed">
                        <QrCode className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  {/* Retry/Refresh Button - always visible when QR is shown */}
                  <button
                    onClick={handleRetryQr}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2
                      ${false ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh QR
                  </button>

                  {/* Device Info */}
                  <div className="bg-gray-50 rounded-lg p-4 w-full max-w-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Device Name:</span>
                        <span className="font-semibold text-gray-900">{form.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number:</span>
                        <span className="font-mono text-gray-900">{form.waNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Device ID:</span>
                        <span className="font-mono text-gray-900">#{result.deviceId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full max-w-sm">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      How to scan
                    </h4>
                    <ol className="text-sm text-blue-700 space-y-1">
                      <li>1. Open WhatsApp on your phone</li>
                      <li>2. Tap Menu or Settings</li>
                      <li>3. Select &quot;Linked Devices&quot;</li>
                      <li>4. Tap &quot;Link a Device&quot;</li>
                      <li>5. Point your camera at this QR code</li>
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 w-full max-w-sm">
                    <button
                      onClick={handleCopyQR}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? "Copied!" : "Copy QR"}
                    </button>
                    <button
                      onClick={handleBackToDevices}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Connected Successfully!</h2>
                  <p className="text-gray-600">Your WhatsApp device is now ready to send messages</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Device Ready</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Device Name:</span>
                      <span className="font-semibold text-gray-900">{form.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number:</span>
                      <span className="font-mono text-gray-900">{form.waNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">Connected & Ready</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBackToDevices}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Go to Devices
                  </button>
                  <button
                    onClick={handleAddAnother}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Add Another Device
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">What&apos;s Next?</h4>
                      <p className="text-sm text-blue-700">
                        You can now send messages using this device. Go to the &quot;Single Send&quot; or &quot;Bulk Message&quot; pages to start messaging.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-green-600" />
            How To Add a Device?
          </h3>

          {step === "qr" && (
            <>
              {/* Real-time Status */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-green-600" />
                  Live Status
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connection:</span>
                    {/* Removed isConnected display */}
                  </div>
                  {/* Removed deviceStatus display */}
                  {deviceStatus && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">QR Code:</span>
                      <span className={`font-medium ${
                        deviceStatus.status === 'scanned' ? 'text-green-600' :
                        deviceStatus.status === 'error' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {deviceStatus.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Tips */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Live Tips
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {/* Removed isConnected and deviceStatus.status checks */}
                  {deviceStatus?.status === 'generated' && (
                    <li>• QR code is active - scan it with WhatsApp</li>
                  )}
                  {deviceStatus?.status === 'scanned' && (
                    <li>• QR code scanned - device is connecting...</li>
                  )}
                </ul>
              </div>
            </>
          )}

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Enter Device Details</h4>
                <p className="text-sm text-gray-600">Provide a name and your WhatsApp number</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Generate QR Code</h4>
                <p className="text-sm text-gray-600">We&apos;ll create a QR code for your device</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Scan with WhatsApp</h4>
                <p className="text-sm text-gray-600">Open WhatsApp and scan the QR code</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-green-600" />
              Tips
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use a descriptive device name</li>
              <li>• Include country code in phone number</li>
              <li>• Keep your phone nearby when scanning</li>
              <li>• Ensure WhatsApp is up to date</li>
              {/* Removed isConnected display */}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 