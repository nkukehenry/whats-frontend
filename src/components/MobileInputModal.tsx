"use client";
import React from "react";
import { Phone } from "lucide-react";

interface MobileInputModalProps {
  isOpen: boolean;
  mobile: string;
  onMobileChange: (mobile: string) => void;
  monthsCount: number;
  onMonthsCountChange: (monthsCount: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function MobileInputModal({
  isOpen,
  mobile,
  onMobileChange,
  monthsCount,
  onMonthsCountChange,
  onConfirm,
  onCancel,
}: MobileInputModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Payment</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please enter your mobile money number and select subscription duration.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Duration
          </label>
          <select
            value={monthsCount}
            onChange={(e) => onMonthsCountChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month} {month === 1 ? 'Month' : 'Months'}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
            <Phone className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="tel"
              className="flex-1 outline-none"
              placeholder="256752567374"
              value={mobile}
              onChange={(e) => onMobileChange(e.target.value)}
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Format: 256752567374 (no spaces or dashes)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onConfirm}
            disabled={!mobile.trim()}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
