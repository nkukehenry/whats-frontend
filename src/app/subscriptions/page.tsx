"use client";
import React from "react";
import { useAppSelector } from "../../hooks";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { Plan } from "../plans/page";

export default function SubscriptionPage() {
  const router = useRouter();
  const { subscription, hydrated } = useAppSelector((state) => state.auth);


  if (!hydrated) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activeTab="subscription" />
        <div className="flex-1 flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activeTab="subscription" />
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">No Active Subscription</h2>
            <p className="text-gray-600 mb-6">You do not have an active subscription. Explore our plans to get started!</p>
            <button
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              onClick={() => router.push("/plans")}
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { plan, startDate, endDate, isActive } = subscription as { plan: Plan, startDate: string, endDate: string, isActive: boolean };
  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab="subscription" />
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Subscription</h2>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">Plan:</span>
              <span className="text-green-700 font-bold">{plan?.name || "-"}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">Status:</span>
              <span className={isActive ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">Start Date:</span>
              <span>{startDate ? new Date(startDate).toLocaleDateString() : "-"}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">End Date:</span>
              <span>{endDate ? new Date(endDate).toLocaleDateString() : "-"}</span>
            </div>
          </div>
          {plan && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Plan Features</h3>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                <li>Price: <span className="font-medium">${(plan.priceCents / 100).toFixed(2)}</span></li>
                <li>Message Limit: <span className="font-medium">{plan.messageLimit}</span></li>
                <li>Device Limit: <span className="font-medium">{plan.deviceLimit}</span></li>
                <li>API Access: <span className="font-medium">{plan.apiAccess ? "Yes" : "No"}</span></li>
                <li>Period: <span className="font-medium">{plan.period}</span></li>
              </ul>
              <button
                className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors w-full"
                onClick={() => router.push("/plans")}
              >
                Change Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 