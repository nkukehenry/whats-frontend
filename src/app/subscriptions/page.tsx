"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../hooks";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { setSubscription } from "../../slices/authSlice";
import { fetchCurrentSubscription } from "../../utils/api";
import type { PaymentPlan } from "../../types/payment";
import { CreditCard, Calendar, CheckCircle, AlertCircle, ArrowRight, Download } from "lucide-react";
import PaymentReceipt from "../../components/PaymentReceipt";

export default function SubscriptionPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { subscription, hydrated, user } = useAppSelector((state) => state.auth);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (user && hydrated) {
      const fetchData = async () => {
        console.log('Fetching subscription data...');
        
        // Always fetch current subscription from API to ensure we have the latest data
        setLoadingSubscription(true);
        try {
          console.log('Fetching current subscription from API...');
          const subscriptionData = await fetchCurrentSubscription();
          console.log('Subscription data from API:', subscriptionData);
          console.log('Subscription success:', subscriptionData.success);
          console.log('Subscription data field:', subscriptionData.data);
          
          if (subscriptionData.success && subscriptionData.data) {
            console.log('Setting subscription in Redux:', subscriptionData.data);
            dispatch(setSubscription(subscriptionData.data));
          } else {
            console.log('No subscription data in response - user may not have a subscription yet');
          }
        } catch (err) {
          console.error('Failed to fetch subscription:', err);
          console.error('Error details:', JSON.stringify(err, null, 2));
        } finally {
          setLoadingSubscription(false);
        }
      };
      fetchData();
    }
  }, [user, hydrated, dispatch]);

  console.log('Current subscription in Redux:', subscription);
  console.log('LocalStorage subscription:', typeof window !== 'undefined' ? localStorage.getItem('subscription') : 'N/A');

  if (!hydrated || loadingSubscription) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activeTab="subscription" />
        <div className="flex-1 flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  if (!subscription) {
    console.log('No subscription found, showing no active subscription message');
    return (
      <div className="flex min-h-screen">
        <Sidebar activeTab="subscription" />
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900">No Active Subscription</h2>
            <p className="text-gray-600 mb-6">
              You need an active subscription to access all features. Choose a plan and complete payment to get started!
            </p>
            
            <div className="space-y-3">
            <button
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              onClick={() => router.push("/plans")}
            >
                <ArrowRight className="w-4 h-4" />
                Choose Plan & Pay
            </button>
              
              <p className="text-xs text-gray-500">
                Secure payment via JPesa • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { plan, startDate, endDate, isActive } = subscription as { plan: PaymentPlan, startDate: string, endDate: string, isActive: boolean };
  
  // Extended plan type for receipt (includes all fields PaymentReceipt needs)
  interface ExtendedPlan extends PaymentPlan {
    messageLimit?: number;
    deviceLimit?: number;
    period?: string;
    basicBotLimit?: number;
    apiBotLimit?: number;
    apiAccess?: boolean;
  }
  
  const receiptPlan = plan as ExtendedPlan;
  
  // Calculate months count from subscription dates
  const calculateMonthsCount = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(1, monthsDiff);
  };

  const monthsCount = calculateMonthsCount();
  
  // Generate a receipt ID from subscription data
  const getReceiptId = () => {
    if (!startDate) return Date.now();
    return new Date(startDate).getTime();
  };

  const isExpiringSoon = () => {
    const endDateObj = new Date(endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = () => {
    const endDateObj = new Date(endDate);
    const today = new Date();
    return endDateObj < today && !plan?.isFree;
  };

  const isReceiptDisabled = () => {
    return plan?.isFree || isExpired();
  };

  const handleManageSubscription = () => {
    router.push("/plans");
  };

  const handleDownloadReceipt = () => {
    if (isReceiptDisabled()) return;
    console.log('Download receipt clicked');
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab="subscription" />
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            {isActive ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <AlertCircle className="w-12 h-12 text-orange-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">Your Subscription</h2>
          
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold">{plan?.name || 'Unknown Plan'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-semibold">${plan?.priceCents ? (plan.priceCents / 3500).toFixed(2) : '0.00'}/month</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span>{startDate ? new Date(startDate).toLocaleDateString() : '-'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">End Date:</span>
              <span>{endDate ? new Date(endDate).toLocaleDateString() : '-'}</span>
            </div>
          </div>

          {/* Status alerts */}
          {isExpired() && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                Your subscription has expired. Please renew to continue using premium features.
              </p>
            </div>
          )}
          
          {isExpiringSoon() && isActive && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Your subscription expires soon. Consider renewing to avoid service interruption.
              </p>
            </div>
          )}

          {/* Plan features */}
          {plan?.features && plan.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Plan Features</h3>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <button
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              onClick={handleManageSubscription}
            >
              <Calendar className="w-4 h-4" />
              Manage Subscription
            </button>

            <button
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                isReceiptDisabled()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={handleDownloadReceipt}
              type="button"
              disabled={isReceiptDisabled()}
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Secure payment processing • Cancel anytime
            </p>
          </div>
        </div>
      </div>
      
      {/* Payment Receipt Modal */}
      {plan && (
        <PaymentReceipt
          isOpen={showReceipt}
          plan={{
            id: plan.id,
            name: plan.name,
            priceCents: plan.priceCents,
            messageLimit: receiptPlan.messageLimit ?? 0,
            deviceLimit: receiptPlan.deviceLimit ?? 0,
            apiAccess: receiptPlan.apiAccess ?? false,
            period: receiptPlan.period ?? 'month',
            basicBotLimit: receiptPlan.basicBotLimit ?? 0,
            apiBotLimit: receiptPlan.apiBotLimit ?? 0,
          }}
          monthsCount={monthsCount}
          paymentId={getReceiptId()}
          startDate={startDate}
          endDate={endDate}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
}