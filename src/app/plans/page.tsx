"use client";
import React, { useEffect, useState } from "react";
import { fetchPublicPlans, subscribeToPlan } from "../../utils/api";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setSubscription } from "../../slices/authSlice";
import { registerFormPaymentThunk, checkPaymentStatusThunk } from "../../slices/paymentThunks";
import { setFlowState, clearCurrentPayment, setPaymentStatus } from "../../slices/paymentSlice";
import { CreditCard, Check, Loader2 } from "lucide-react";
import type { PaymentStatus, RegisterFormPaymentResponse } from "../../types/payment";
import PaymentProcessingModal from "../../components/PaymentProcessingModal";
import PaymentReceipt from "../../components/PaymentReceipt";
import SubscriptionDurationModal from "../../components/SubscriptionDurationModal";

export interface Plan {
  id: number;
  name: string;
  priceCents: number;
  messageLimit: number;
  deviceLimit: number;
  apiAccess: boolean;
  period: string;
  isFree: boolean;
  trialPeriodDays: number;
  basicBotLimit: number;
  apiBotLimit: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState<number | null>(null);
  const [monthsCount, setMonthsCount] = useState(1);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedPlanForDuration, setSelectedPlanForDuration] = useState<Plan | null>(null);
  const [receiptData, setReceiptData] = useState<{
    plan: Plan;
    monthsCount: number;
    paymentId: number;
  } | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { subscription } = useAppSelector((state) => state.auth);
  const { flowState, currentPayment } = useAppSelector((state) => state.payment);
  const currentPlanId = (subscription as { plan?: { id?: number } })?.plan?.id;

  // Fetch plans on mount
  useEffect(() => {
    fetchPublicPlans()
      .then((res) => {
        setPlans(res.data as Plan[]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load plans");
        setLoading(false);
      });
  }, []);

  // Start payment status checking (defined early for use in useEffect)
  const startPaymentStatusCheck = React.useCallback((paymentId: number, planId: number) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start checking status asynchronously
    intervalRef.current = setInterval(async () => {
      try {
        console.log('Checking payment status for paymentId:', paymentId);
        
        const result = await dispatch(checkPaymentStatusThunk({ paymentId }));
        
        console.log('Status check result:', result);
        
        if (result.type === 'payment/checkPaymentStatus/fulfilled' && result.payload) {
          const status = (result.payload as PaymentStatus).status;
          console.log('Payment status:', status);
          
          dispatch(setPaymentStatus(result.payload as PaymentStatus));
          
          if (status === 'COMPLETED') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            dispatch(setFlowState('completed'));
            setPaymentProcessing(null);
            
            // Clean up sessionStorage
            sessionStorage.removeItem('pendingPaymentId');
            sessionStorage.removeItem('paymentPlanId');
            
            // Complete the subscription after successful payment
            try {
              console.log('Completing subscription for planId:', planId);
              const res = await subscribeToPlan(planId);
              dispatch(setSubscription(res.data));
              
              // Show receipt instead of success message
              const plan = plans.find((p) => p.id === planId);
              if (plan) {
                setReceiptData({
                  plan,
                  monthsCount: monthsCount,
                  paymentId: paymentId,
                });
                setShowReceipt(true);
              } else {
                setSuccess("Subscribed!");
              }
            } catch (err) {
              console.error('Subscription failed:', err);
              setError('Payment successful but subscription failed. Please contact support.');
            }
          } else if (status === 'FAILED' || status === 'CANCELLED') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            dispatch(setFlowState('failed'));
            setPaymentProcessing(null);
            
            // Clean up sessionStorage
            sessionStorage.removeItem('pendingPaymentId');
            sessionStorage.removeItem('paymentPlanId');
            
            setError('Payment failed. Please try again.');
          }
        } else if (result.type === 'payment/checkPaymentStatus/rejected') {
          console.error('Status check rejected:', result.payload);
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    }, 5000); // Check every 5 seconds

    // Clear interval after 10 minutes
    setTimeout(() => {
      if (intervalRef.current) {
        console.log('Stopping status check after 10 minutes');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        
        // Clean up sessionStorage if still pending after timeout
        sessionStorage.removeItem('pendingPaymentId');
        sessionStorage.removeItem('paymentPlanId');
        dispatch(setFlowState('idle'));
        setPaymentProcessing(null);
        setError('Payment timeout. Please try again.');
      }
    }, 600000);
  }, [dispatch]);

  // Handle stale payment state and resume payment check on mount
  useEffect(() => {
    const checkAndResumePayment = async () => {
      // Clean up any stale sessionStorage data from previous sessions
      const pendingPaymentId = sessionStorage.getItem('pendingPaymentId');
      const paymentPlanId = sessionStorage.getItem('paymentPlanId');
      
      if (pendingPaymentId && paymentPlanId) {
        try {
          // Check if this payment is still pending by checking its status once
          const result = await dispatch(checkPaymentStatusThunk({ paymentId: parseInt(pendingPaymentId) }));
          
          if (result.type === 'payment/checkPaymentStatus/fulfilled' && result.payload) {
            const status = (result.payload as PaymentStatus).status;
            if (status === 'PENDING') {
              // Resume status checking if still pending
              console.log('Resuming payment status check for paymentId:', pendingPaymentId);
              setPaymentProcessing(parseInt(paymentPlanId));
              dispatch(setFlowState('processing'));
              startPaymentStatusCheck(parseInt(pendingPaymentId), parseInt(paymentPlanId));
            } else {
              // Clean up if payment is already complete/failed
              console.log('Cleaning up stale payment data - payment is', status);
              sessionStorage.removeItem('pendingPaymentId');
              sessionStorage.removeItem('paymentPlanId');
            }
          }
        } catch (err) {
          // If check fails, clean up stale data
          console.error('Error checking payment status:', err);
          sessionStorage.removeItem('pendingPaymentId');
          sessionStorage.removeItem('paymentPlanId');
        }
      } else {
        // Clear any existing flow state if no pending payment
        dispatch(setFlowState('idle'));
        dispatch(clearCurrentPayment());
      }
    };

    checkAndResumePayment();
  }, [dispatch, startPaymentStatusCheck]);

  // Handle payment flow for paid plans using JPesa form
  const handlePaidPlanSubscription = async (plan: Plan, selectedMonthsCount: number = monthsCount) => {
    setError(null);
    setPaymentProcessing(plan.id);
    dispatch(setFlowState('registering'));
    
    try {
      console.log('Registering form payment for plan:', plan.id, 'for', selectedMonthsCount, 'months');
      
      const result = await dispatch(registerFormPaymentThunk({
        planId: plan.id,
        currency: 'USD',
        description: `${plan.name} Subscription`,
        note: `Subscription for ${selectedMonthsCount} ${selectedMonthsCount === 1 ? 'month' : 'months'}`,
        monthsCount: selectedMonthsCount,
      }));

      console.log('Payment registration result:', result);

      if (result.type === 'payment/registerFormPayment/fulfilled' && result.payload) {
        console.log('Payment registered successfully:', result.payload);
        
        const paymentData = result.payload as RegisterFormPaymentResponse['data'];
        
        // Store payment ID for status checking
        sessionStorage.setItem('pendingPaymentId', paymentData.paymentId.toString());
        sessionStorage.setItem('paymentPlanId', plan.id.toString());
        
        dispatch(setFlowState('submitting'));
        
        // Submit form to JPesa
        submitPaymentForm(paymentData.formData, paymentData.paymentId, plan.id);
      } else if (result.type === 'payment/registerFormPayment/rejected') {
        console.error('Payment registration rejected:', result.payload);
        const errorMessage = typeof result.payload === 'string' ? result.payload : 'Failed to register payment. Please try again.';
        setError(errorMessage);
        setPaymentProcessing(null);
        dispatch(setFlowState('failed'));
      }
    } catch (err) {
      console.error('Payment registration failed:', err);
      setError('Failed to register payment. Please try again.');
      setPaymentProcessing(null);
      dispatch(setFlowState('failed'));
    }
  };

  // Submit payment form to JPesa external link
  const submitPaymentForm = (
    formData: { action: string; ownerid: string; amount: number; cur: string; description: string; return: string; cancel: string },
    paymentId: number,
    planId: number
  ) => {
    try {
      // Create form element (matching actual JPesa form structure)
      const form = document.createElement('form');
      form.name = 'JPesa';
      form.method = 'POST';
      form.action = formData.action;
      form.target = '_blank'; // Open in new tab/window
      
      // Add hidden fields
      const hiddenFields = {
        ownerid: formData.ownerid,
        description: formData.description,
        return: formData.return,
        cancel: formData.cancel
      };
      
      Object.entries(hiddenFields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });
      
      // Add currency select dropdown
      const currencySelect = document.createElement('select');
      currencySelect.name = 'cur';
      
      // Add currency options
      const currencies = ['UGX', 'KES', 'USD'];
      currencies.forEach(curr => {
        const option = document.createElement('option');
        option.value = curr;
        option.textContent = curr;
        if (curr === formData.cur) {
          option.selected = true;
        }
        currencySelect.appendChild(option);
      });
      
      form.appendChild(currencySelect);
      
      // Add amount input field
      const amountInput = document.createElement('input');
      amountInput.name = 'amount';
      amountInput.type = 'text';
      amountInput.size = 15;
      amountInput.value = formData.amount.toString();
      form.appendChild(amountInput);
      
      // Add submit button
      const submitButton = document.createElement('input');
      submitButton.type = 'submit';
      submitButton.name = 'pay';
      submitButton.value = 'Make Payment';
      form.appendChild(submitButton);
      
      // Submit form
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      // Set processing state and start status checking
      dispatch(setFlowState('processing'));
      startPaymentStatusCheck(paymentId, planId);
      
    } catch (err) {
      console.error('Form submission failed:', err);
      setError('Failed to submit payment form. Please try again.');
      setPaymentProcessing(null);
      dispatch(setFlowState('failed'));
    }
  };

  // Store interval reference for cleanup
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activeTab="subscription" />
        <div className="flex-1 flex items-center justify-center">Loading plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activeTab="subscription" />
        <div className="flex-1 flex flex-col items-center justify-center text-red-600">
          <div>{error}</div>
          {error === "Session expired. Please log in again." && (
            <button
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              onClick={() => router.push("/login")}
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activeTab="subscription" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Subscribed!</h2>
            <p className="text-gray-700 mb-6">You have successfully subscribed to a plan.</p>
            <button
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              onClick={() => router.push("/subscriptions")}
            >
              Go to My Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab="subscription" />
      <div className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Choose Your Plan</h1>
          
          {/* Payment Processing Modal */}
          <PaymentProcessingModal isOpen={flowState === 'registering' || flowState === 'submitting' || flowState === 'processing'} />

          {/* Payment Receipt Modal */}
          {receiptData && (
            <PaymentReceipt
              isOpen={showReceipt}
              plan={receiptData.plan}
              monthsCount={receiptData.monthsCount}
              paymentId={receiptData.paymentId}
              onClose={() => {
                setShowReceipt(false);
                setReceiptData(null);
              }}
            />
          )}

          {/* Subscription Duration Modal */}
          {selectedPlanForDuration && (
            <SubscriptionDurationModal
              isOpen={showDurationModal}
              planName={selectedPlanForDuration.name}
              planPriceCents={selectedPlanForDuration.priceCents}
              planPeriod={selectedPlanForDuration.period}
              currentMonthsCount={monthsCount}
              onConfirm={(months) => {
                setMonthsCount(months);
                setShowDurationModal(false);
                // Proceed with payment registration after selecting duration
                handlePaidPlanSubscription(selectedPlanForDuration, months);
                setSelectedPlanForDuration(null);
              }}
              onCancel={() => {
                setShowDurationModal(false);
                setSelectedPlanForDuration(null);
              }}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg p-8 flex flex-col items-center border-2 ${
                  plan.isFree 
                    ? 'border-blue-200 hover:border-blue-300' 
                    : 'border-gray-200 hover:border-gray-300'
                } hover:shadow-2xl transition-shadow relative`}
              >
                {plan.isFree && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      FREE
                    </div>
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-green-700 mb-2">{plan.name}</h2>
                
                <div className="text-3xl font-extrabold text-gray-900 mb-4">
                  {plan.isFree ? (
                    <span className="text-blue-600">Free</span>
                  ) : (
                    <>
                      ${(plan.priceCents / 3500).toFixed(2)}
                     <span className="text-base font-medium text-gray-500 ml-1">/ {plan.period}</span>
                    </>
                  )}
                </div>

                {!plan.isFree && ( <div className="text-xl font-extrabold text-gray-900 mb-4">
                      ${(((plan.priceCents  / 3500 -((plan.priceCents  / 3500)*0.1))*12)).toFixed(2)}
                     <span className="text-base font-medium text-gray-500 ml-1">/Yearly</span>
                </div>
                  )}

                {plan.trialPeriodDays > 0 && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 w-full">
                    <p className="text-sm text-green-800 text-center">
                      <strong>{plan.trialPeriodDays} days free trial</strong>
                    </p>
                </div>
                )}
                
                <ul className="text-gray-700 text-sm mb-6 space-y-1 w-full">
                  <li><span className="font-medium">Message Limit:</span> {plan.messageLimit}</li>
                  <li><span className="font-medium">Device Limit:</span> {plan.deviceLimit}</li>
                  <li><span className="font-medium">API Access:</span> {plan.apiAccess ? "Yes" : "No"}</li>
                   <li><span className="font-medium">Basic Bots:</span> {plan.basicBotLimit }</li>
                   <li><span className="font-medium">Premium Bots:</span> {plan.apiBotLimit }</li>
                </ul>
                
                {currentPlanId === plan.id  &&(
                  <span className="mt-auto bg-green-100 text-green-700 px-6 py-2 rounded-lg font-semibold w-full text-center cursor-default border border-green-300">
                    Current Plan
                  </span>
                ) }

                  <button
                    className={`mt-2 px-6 py-2 rounded-lg font-semibold w-full disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${
                      plan.isFree
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    disabled={subscribing === plan.id || paymentProcessing === plan.id}
                    onClick={async () => {
                      console.log('Button clicked for plan:', plan.id, 'isFree:', plan.isFree);
                      if (plan.isFree) {
                        // Handle free plan subscription
                      setSubscribing(plan.id);
                      setError(null);
                      try {
                        const res = await subscribeToPlan(plan.id);
                        dispatch(setSubscription(res.data));
                        
                        // Show receipt for free plan too
                        setReceiptData({
                          plan,
                          monthsCount: 1, // Free plans are typically 1 month
                          paymentId: Date.now(), // Generate a receipt ID for free plans
                        });
                        setShowReceipt(true);
                      } catch (err: unknown) {
                        if (err && typeof err === 'object' && 'message' in err) {
                          setError((err as { message?: string }).message || "Failed to subscribe");
                        } else {
                          setError("Failed to subscribe");
                        }
                      } finally {
                        setSubscribing(null);
                        }
                      } else {
                        // Show duration selection modal before payment registration
                        setSelectedPlanForDuration(plan);
                        setShowDurationModal(true);
                      }
                    }}
                  >
                    {subscribing === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Subscribing...
                      </>
                    ) : paymentProcessing === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : plan.isFree ? (
                      <>
                        <Check className="w-4 h-4" />
                        Get Started Free
                      </>
                    ) : currentPlanId === plan.id ? (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Renew
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Subscribe & Pay
                      </>
                    )}
                  </button>
              </div>
            ))}
          </div>

          {/* Payment Info */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Supported Payment Methods:</h4>
                <ul className="space-y-1">
                  <li>• Mobile Money (MTN, Airtel, etc.)</li>
                  <li>• Credit/Debit Cards</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Security:</h4>
                <ul className="space-y-1">
                  <li>• SSL encrypted payments</li>
                  <li>• Secure payment processing</li>
                  <li>• No card details stored</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 