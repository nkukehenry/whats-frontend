"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchDevicesThunk, fetchDeviceStatusThunk } from "../../slices/deviceThunks";
import { logout } from "../../slices/authSlice";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import {
  Smartphone,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Send,
  BarChart3,
  FileText,
  Rocket,
  Calendar,
  List,
  User,
  HelpCircle,
  LogOut,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { Device } from "../../slices/deviceSlice";
import { DeviceStatusIndicator } from "../../components/DeviceStatusIndicator";
// Removed: import { WebSocketStatus } from "../../components/WebSocketStatus";
// Removed: import { MessageNotification } from "../../components/MessageNotification";
// Removed: import { useWebSocket } from "../../hooks/useWebSocket";

export default function DevicesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { devices, loading, error } = useAppSelector((state) => state.devices);
  const token = useAppSelector((state) => state.auth.token);
  // Removed: const { getDeviceStatus, isConnected, socket } = useWebSocket();
  const [deviceQrMap, setDeviceQrMap] = useState<{ [deviceId: number]: { qr?: string; qrDataUrl?: string } }>({});
  const [deviceStatusMap, setDeviceStatusMap] = useState<{ [deviceId: number]: string }>({});
  const [qrTimers, setQrTimers] = useState<{ [deviceId: number]: number }>({});
  const [qrExpiredMap, setQrExpiredMap] = useState<{ [deviceId: number]: boolean }>({});
  const [qrInitializingMap, setQrInitializingMap] = useState<{ [deviceId: number]: boolean }>({});
  const qrIntervalRefs = React.useRef<{ [deviceId: number]: NodeJS.Timeout }>({});
  // Removed: const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  console.log('DevicesPage render, devices:', devices, 'deviceQrMap:', deviceQrMap);

  // Redirect to login if not authenticated
  React.useEffect(() => {
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



  // Timer for each device's QR
  useEffect(() => {
    Object.keys(deviceQrMap).forEach((id) => {
      const deviceId = Number(id);
      if (qrIntervalRefs.current[deviceId]) clearInterval(qrIntervalRefs.current[deviceId]);
      if (deviceQrMap[deviceId] && !qrExpiredMap[deviceId]) {
        qrIntervalRefs.current[deviceId] = setInterval(() => {
          setQrTimers((prev) => {
            const t = prev[deviceId] ?? 60;
            if (t <= 1) {
              setQrExpiredMap((prev) => ({ ...prev, [deviceId]: true }));
              clearInterval(qrIntervalRefs.current[deviceId]);
              return { ...prev, [deviceId]: 0 };
            }
            return { ...prev, [deviceId]: t - 1 };
          });
        }, 1000);
      }
    });
    return () => {
      Object.values(qrIntervalRefs.current).forEach(clearInterval);
    };
  }, [deviceQrMap, qrExpiredMap]);

  // Retry/refresh QR for a device
  const handleRetryQr = async (deviceId: number) => {
    setQrExpiredMap((prev) => ({ ...prev, [deviceId]: false }));
    setQrTimers((prev) => ({ ...prev, [deviceId]: 60 }));
    setDeviceQrMap((prev) => ({ ...prev, [deviceId]: {} }));
    setQrInitializingMap((prev) => ({ ...prev, [deviceId]: true }));
    console.log("[DEBUG] handleRetryQr called for deviceId:", deviceId);
    try {
      // Use Redux thunk to fetch device status (and QR)
      const resultAction = await dispatch(fetchDeviceStatusThunk({ deviceId }));
      if (fetchDeviceStatusThunk.fulfilled.match(resultAction)) {
        const data = resultAction.payload;
        setDeviceQrMap((prev) => ({ ...prev, [deviceId]: { qr: data.qr, qrDataUrl: data.qrDataUrl } }));
        setQrInitializingMap((prev) => ({ ...prev, [deviceId]: false }));
        if (data.status) setDeviceStatusMap((prev) => ({ ...prev, [deviceId]: data.status ?? '' }));
      } else {
        setQrInitializingMap((prev) => ({ ...prev, [deviceId]: false }));
      }
    } catch (err) {
      setQrInitializingMap((prev) => ({ ...prev, [deviceId]: false }));
      console.error("[DEBUG] fetchDeviceStatusThunk failed:", err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  const handleAddDevice = () => {
    router.push("/devices/add");
  };

  const renderDeviceCard = (device: Device) => {
    // Use live status if available, otherwise fallback to API status
    const liveStatus = deviceStatusMap[device.id];
    const status = liveStatus !== undefined ? liveStatus : (device.isActive ? 'ready' : 'disconnected');
    const qrObj = deviceQrMap[device.id] || {};
    const qr = qrObj.qr;
    const qrDataUrl = qrObj.qrDataUrl;
    // Debug log for QR rendering
    let qrImgUrl = undefined;
    if (qrDataUrl) {
      qrImgUrl = qrDataUrl;
    } else if (qr) {
      qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=200x200`;
    }
    console.log('Render QR for device', device.id, { qr, qrDataUrl, qrImgUrl });
    const timer = qrTimers[device.id] ?? 60;
    const expired = qrExpiredMap[device.id];
    const qrInitializing = qrInitializingMap[device.id];
    const isQrState = status === 'qr' || status === 'qr_required' || status === 'connecting';
    return (
      <div
        key={device.id}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{device.name}</h3>
          <DeviceStatusIndicator deviceId={device.id} />
        </div>
        <p className="text-gray-600 text-sm mb-2 font-mono">{device.waNumber}</p>
        <p className="text-gray-500 text-xs mb-4">
          Added: {device.createdAt ? new Date(device.createdAt).toLocaleDateString() : "Unknown"}
        </p>
        {/* Show QR, timer, and retry if device is not ready */}
        {isQrState && (
          <div className="mb-4 flex flex-col items-center space-y-2">
            {qrInitializing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                <span className="text-gray-500 text-sm">Initializing device, waiting for QR...</span>
              </div>
            ) : (qrDataUrl || qr) ? (
              <>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Scan QR" />
                  ) : qr ? (
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=200x200`} alt="Scan QR" />
                  ) : null}
                </div>
                <span className="text-gray-500 text-xs">Scan this QR with your WhatsApp app</span>
              </>
            ) : null}
            {/* Timer */}
            {qr && !expired && (
              <div className="text-xs text-blue-700">QR expires in {timer}s</div>
            )}
            {expired && (
              <div className="text-xs text-red-600 font-semibold">QR code expired. Please retry.</div>
            )}
            {/* Retry/Refresh Button */}
            <button
              onClick={() => handleRetryQr(device.id)}
              className={`px-4 py-1 rounded-lg font-semibold transition-colors flex items-center gap-2
                ${expired ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <RefreshCw className="w-4 h-4" />
              {expired ? 'Retry' : 'Refresh QR'}
            </button>
          </div>
        )}
        {/* Show Scan QR button if device is not connected or needs QR */}
        {(status === 'error' || status === 'disconnected' || status === 'qr_required') && (
          <button
            onClick={() => handleRetryQr(device.id)}
            className="px-4 mb-2 py-1 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 mt-2"
            disabled={qrInitializing}
          >
            {qrInitializing ? 'Initializing...' : 'Scan QR'}
          </button>
        )}
        
        <div className="flex gap-2">
          <button
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            onClick={() => {
              router.push(`/messages?deviceId=${device.id}`);
            }}
          >
            Send Message
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeTab="devices" />

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">My Devices</h1>
              {/* Removed: <WebSocketStatus showDetails={true} /> */}
            </div>
            <button
              onClick={handleAddDevice}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Device
            </button>
          </div>

          {/* Message Notifications */}
          {/* Removed: <MessageNotification /> */}

          {/* Stats */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Devices</p>
                    <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Devices</p>
                    <p className="text-2xl font-bold text-green-600">
                      {devices.filter((d) => d.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <XCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inactive Devices</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {devices.filter((d) => !d.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Devices List */}
          <div className="space-y-6">
            {loading && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                  <p className="text-gray-600">Loading devices...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">Error: {error}</p>
                </div>
              </div>
            )}

            {!loading && !error && devices.length === 0 && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No devices yet</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first WhatsApp device</p>
                <button
                  onClick={handleAddDevice}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Device
                </button>
              </div>
            )}

            {!loading && !error && devices.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Your Devices</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {devices.map((device) => renderDeviceCard(device))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-green-600" />
            How To Get Started?
          </h3>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Add Your Device</h4>
                <p className="text-sm text-gray-600">Connect your WhatsApp account to start sending messages</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Scan QR Code</h4>
                <p className="text-sm text-gray-600">Open WhatsApp on your phone and scan the QR code</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Start Messaging</h4>
                <p className="text-sm text-gray-600">Send individual or bulk messages to your contacts</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-green-600" />
              Need Help?
            </h4>
            <p className="text-sm text-gray-600 mb-4">Check our documentation or contact support</p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Get Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 