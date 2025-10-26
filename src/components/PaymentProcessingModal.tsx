"use client";
import React from "react";
import { Loader2 } from "lucide-react";

interface PaymentProcessingModalProps {
  isOpen: boolean;
}

export default function PaymentProcessingModal({
  isOpen,
}: PaymentProcessingModalProps) {
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
        className="rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-white/20"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
        <p className="text-gray-600 mb-4">
          Please complete your payment. You will be redirected back once payment is complete.
        </p>
        <div className="text-sm text-gray-500">
          Do not close this window until payment is complete.
        </div>
      </div>
    </div>
  );
}
