"use client";
import React, { useState } from "react";
import { Calendar, X } from "lucide-react";

interface SubscriptionDurationModalProps {
  isOpen: boolean;
  planName: string;
  planPriceCents: number;
  planPeriod: string;
  currentMonthsCount: number;
  onConfirm: (monthsCount: number) => void;
  onCancel: () => void;
}

export default function SubscriptionDurationModal({
  isOpen,
  planName,
  planPriceCents,
  planPeriod,
  currentMonthsCount,
  onConfirm,
  onCancel,
}: SubscriptionDurationModalProps) {
  const initialMonths = currentMonthsCount > 0 ? currentMonthsCount : 1;
  const [selectedMonths, setSelectedMonths] = useState(initialMonths % 12);
  const [selectedYears, setSelectedYears] = useState(Math.floor(initialMonths / 12));

  if (!isOpen) return null;

  const totalMonths = selectedMonths + (selectedYears * 12);
  const totalPrice = (planPriceCents * totalMonths) / 3500; // Convert cents to USD
  const monthlyPrice = planPriceCents / 3500;

  const handleConfirm = () => {
    if (totalMonths > 0) {
      onConfirm(totalMonths);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
      onClick={onCancel}
    >
      <div 
        className="rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Select Subscription Duration
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          Plan: <span className="font-semibold text-green-700">{planName}</span>
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Price: <span className="font-semibold">${monthlyPrice.toFixed(2)}</span> per {planPeriod}
        </p>
        
        <div className="space-y-4 mb-6">
          {/* Years Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years
            </label>
            <select
              value={selectedYears}
              onChange={(e) => {
                const years = parseInt(e.target.value);
                const newTotalMonths = years * 12 + selectedMonths;
                if (newTotalMonths === 0) {
                  setSelectedYears(years);
                  setSelectedMonths(1);
                } else {
                  setSelectedYears(years);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {Array.from({ length: 6 }, (_, i) => i).map((year) => (
                <option key={year} value={year}>
                  {year === 0 ? '0 Years' : `${year} ${year === 1 ? 'Year' : 'Years'}`}
                </option>
              ))}
            </select>
          </div>

          {/* Months Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Months
            </label>
            <select
              value={selectedMonths}
              onChange={(e) => {
                const months = parseInt(e.target.value);
                const newTotalMonths = selectedYears * 12 + months;
                if (newTotalMonths === 0) {
                  setSelectedMonths(1);
                } else {
                  setSelectedMonths(months);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {Array.from({ length: 13 }, (_, i) => i).map((month) => (
                <option key={month} value={month}>
                  {month === 0 ? '0 Months' : `${month} ${month === 1 ? 'Month' : 'Months'}`}
                </option>
              ))}
            </select>
          </div>
          
          {/* Total Summary */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-green-800">Total Duration:</span>
              <span className="text-lg font-bold text-green-900">
                {totalMonths} {totalMonths === 1 ? 'Month' : 'Months'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-800">Total Amount:</span>
              <span className="text-xl font-bold text-green-900">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-green-700 mt-2 pt-2 border-t border-green-200">
              ${monthlyPrice.toFixed(2)} × {totalMonths} {planPeriod}{totalMonths !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={totalMonths === 0}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

