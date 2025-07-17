"use client";
import React from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface DeviceStatusIndicatorProps {
  deviceId: number;
  showReconnectButton?: boolean;
  className?: string;
}

const getStatusIcon = (status: string, isConnected: boolean) => {
  switch (status) {
    case 'ready':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'connecting':
      return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
    case 'disconnected':
      return <WifiOff className="w-4 h-4 text-red-500" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'qr_required':
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    default:
      return isConnected ? 
        <Wifi className="w-4 h-4 text-green-500" /> : 
        <WifiOff className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'ready':
      return 'Ready';
    case 'connecting':
      return 'Connecting...';
    case 'disconnected':
      return 'Disconnected';
    case 'error':
      return 'Error';
    case 'qr_required':
      return 'QR Required';
    default:
      return 'Unknown';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ready':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'connecting':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'disconnected':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'qr_required':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const DeviceStatusIndicator: React.FC<DeviceStatusIndicatorProps> = ({
  deviceId,
  showReconnectButton = true,
  className = ''
}) => {
  // Remove: const { devices, reconnectDevice, isConnected: wsConnected } = useWebSocketContext();
  
  // Refactor to use device status from props or Redux only, remove reconnectDevice and wsConnected logic
  // Assuming device status is passed as a prop or available in the component's context
  // For now, we'll simulate a device object for demonstration purposes
  const device = {
    deviceId: deviceId,
    status: 'ready', // Placeholder status
    isConnected: true, // Placeholder connection status
    errorMessage: null,
    messageCount: 0,
  };
  
  if (!device) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${className}`}>
        <WifiOff className="w-4 h-4 text-gray-400" />
        <span className="text-gray-500">Status Unknown</span>
        {/* Remove: {!wsConnected && ( */}
        {/*   <span className="text-xs text-red-500">(WebSocket Disconnected)</span> */}
        {/* )} */}
      </div>
    );
  }

  // Remove: const handleReconnect = () => {
  // Remove:   reconnectDevice(deviceId);
  // Remove: };

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${getStatusColor(device.status)} ${className}`}>
      {getStatusIcon(device.status, device.isConnected)}
      <span className="font-medium">{getStatusText(device.status)}</span>
      
      {device.errorMessage && (
        <span className="text-xs opacity-75" title={device.errorMessage}>
          {device.errorMessage && (device.errorMessage as string).length > 20 ? (device.errorMessage as string).substring(0, 20) + '...' : device.errorMessage}
        </span>
      )}
      
      {showReconnectButton && device.status !== 'ready' && (
        <button
          // Remove: onClick={handleReconnect}
          className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          title="Reconnect Device"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
      
      {device.messageCount > 0 && (
        <span className="text-xs bg-white/20 px-1 rounded">
          {device.messageCount} msgs
        </span>
      )}
    </div>
  );
}; 