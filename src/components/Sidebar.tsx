"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logout } from "../slices/authSlice";
import {
  Smartphone,
  BarChart3,
  FileText,
  Send,
  Rocket,
  Calendar,
  List,
  Settings,
  User,
  HelpCircle,
  LogOut,
  Home,
} from "lucide-react";

interface SidebarProps {
  activeTab?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
}

export default function Sidebar({ 
  activeTab = "dashboard", 
  showBackButton = false,
  backButtonText = "Back",
  onBackClick 
}: SidebarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  const navigationItems = [
    { id: "subscription", label: "Subscription", icon: Settings, path: "/subscriptions" },
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/dashboard" },
    { id: "devices", label: "My Devices", icon: Smartphone, path: "/devices" },
    //{ id: "templates", label: "Templates", icon: FileText, path: "/templates" },
    { id: "send", label: "Single Send", icon: Send, path: "/messages" },
    { id: "bulk", label: "Bulk Message", icon: Rocket, path: "/messages/bulk" },
   // { id: "scheduled", label: "Scheduled", icon: Calendar, path: "/scheduled" },
    //{ id: "logs", label: "Message Log", icon: List, path: "/logs" },
  ];

  const settingsItems = [
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
    { id: "help", label: "Help", icon: HelpCircle, path: "/help" },
  ];

  const handleNavigation = (item: typeof navigationItems[0]) => {
    if (item.path) {
      router.push(item.path);
    }
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-3 shadow-sm">
            G
          </div>
          <span className="font-bold text-gray-900 text-lg">Geni WhatsApp</span>
        </div>

        {/* Back Button (if needed) */}
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className="w-full mb-6 flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            {backButtonText}
          </button>
        )}

        {/* Main Navigation */}
        <nav className="space-y-1 mb-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                  activeTab === item.id ? "bg-green-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">Settings</h3>
          <nav className="space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center gap-3 ${
                    activeTab === item.id ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            {/* Developer Docs Link */}
            <button
              onClick={() => router.push("/dev-docs")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center gap-3 ${
                activeTab === "dev-docs" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">Developer Docs</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>

        {/* User Info */}
        {user && (
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {user.email?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 