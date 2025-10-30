"use client";
import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import { useAppDispatch } from "../../../hooks";
import { subscribeToPlan } from "../../../utils/api";
import { setSubscription } from "../../../slices/authSlice";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const status = searchParams.get('status');
  const memo = searchParams.get('memo');
  const ref = searchParams.get('ref');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Clear any pending payment from session storage
      const paymentPlanId = sessionStorage.getItem('paymentPlanId');
      sessionStorage.removeItem('pendingPaymentId');
      sessionStorage.removeItem('paymentPlanId');
      
      // If payment is approved and we have a plan ID, complete the subscription
      if (status === 'approved' && paymentPlanId) {
        try {
          const planId = parseInt(paymentPlanId);
          const res = await subscribeToPlan(planId);
          dispatch(setSubscription(res.data));
        } catch (err) {
          console.error('Failed to complete subscription:', err);
        }
      }
    };

    handlePaymentSuccess();
  }, [status, dispatch]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToPlans = () => {
    router.push('/plans');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="plans" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          {status === 'approved' ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for your payment. Your subscription has been activated and you now have access to all premium features.
              </p>
              
              {memo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>Payment Reference:</strong> {memo}
                  </p>
                  {ref && (
                    <p className="text-sm text-green-800 mt-1">
                      <strong>Transaction ID:</strong> {ref}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </button>
                
                <button
                  onClick={handleGoToPlans}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  View Plans
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-yellow-600 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Payment Received
              </h1>
              <p className="text-gray-600 mb-6">
                We have received your payment request. It may take a few minutes to process and activate your subscription.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
