"use client";
import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const status = searchParams.get('status');
  const memo = searchParams.get('memo');
  const ref = searchParams.get('ref');

  useEffect(() => {
    // Clear any pending payment from session storage
    sessionStorage.removeItem('pendingPaymentId');
    sessionStorage.removeItem('paymentPlanId');
  }, []);

  const handleTryAgain = () => {
    router.push('/plans');
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="plans" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <XCircle className="w-16 h-16 text-orange-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges have been made to your account. 
            You can try again anytime when you&apos;re ready.
          </p>
          
          {(memo || ref) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              {memo && (
                <p className="text-sm text-orange-800">
                  <strong>Reference:</strong> {memo}
                </p>
              )}
              {ref && (
                <p className="text-sm text-orange-800 mt-1">
                  <strong>Transaction ID:</strong> {ref}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Having trouble with payments? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
