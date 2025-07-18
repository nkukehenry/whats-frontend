"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchDevicesThunk } from "../../slices/deviceThunks";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import {
  BarChart3,
  Smartphone,
  Send,
  Users,
  CheckCircle,
  AlertCircle,
  Rocket,
} from "lucide-react";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { devices } = useAppSelector((state) => state.devices);

  // Fetch devices when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchDevicesThunk());
    }
  }, [user, dispatch]);

  // Calculate stats
  const totalDevices = devices.length;
  const connectedDevices = devices.filter((device) => device.isActive).length;
  const disconnectedDevices = totalDevices - connectedDevices;

  const stats = [
    {
      title: "Total Devices",
      value: totalDevices,
      icon: Smartphone,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Connected",
      value: connectedDevices,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Disconnected",
      value: disconnectedDevices,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Messages Sent",
      value: "1,234",
      icon: Send,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const quickActions = [
    {
      title: "Add Device",
      description: "Connect a new WhatsApp device",
      icon: Smartphone,
      color: "text-green-600",
      bgColor: "bg-green-100",
      onClick: () => router.push("/devices/add"),
    },
    {
      title: "Send Message",
      description: "Send a single message",
      icon: Send,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      onClick: () => router.push("/messages"),
    },
    {
      title: "Bulk Message",
      description: "Send messages to multiple recipients",
      icon: Rocket,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      onClick: () => router.push("/messages/bulk"),
    },
    {
      title: "View Devices",
      description: "Manage your connected devices",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      onClick: () => router.push("/devices"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeTab="dashboard" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
                >
                  <div className={`p-3 rounded-lg ${action.bgColor} w-fit mb-4`}>
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Removed Recent Activity section */}
      </div>
    </div>
  );
}
