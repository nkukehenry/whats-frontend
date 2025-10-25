"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { checkPaymentStatusThunk } from "../slices/paymentThunks";
import { setFlowState } from "../slices/paymentSlice";
import { useRouter } from "next/navigation";
import type { PaymentStatus } from "../types/payment";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface PaymentStatusCheckerProps {
  paymentId: number;
  onComplete?: () => void;
  onError?: () => void;
}

export default function PaymentStatusChecker({ 
  paymentId, 
  onComplete, 
  onError 
}: PaymentStatusCheckerProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { checkingStatus, paymentStatus, error } = useAppSelector((state) => state.payment);
  const [checkCount, setCheckCount] = useState(0);
  const maxChecks = 120; // 10 minutes with 5-second intervals

  useEffect(() => {
    const checkInterval = setInterval(async () => {
      try {
        setCheckCount(prev => prev + 1);
        
        const result = await dispatch(checkPaymentStatusThunk({ paymentId }));
        
        if (result.type === 'payment/checkPaymentStatus/fulfilled' && result.payload) {
          const status = (result.payload as PaymentStatus).status;
          
          if (status === 'COMPLETED') {
            clearInterval(checkInterval);
            dispatch(setFlowState('completed'));
            onComplete?.();
            
            // Redirect to success page after a short delay
            setTimeout(() => {
              router.push('/payment/success');
            }, 2000);
          } else if (status === 'FAILED' || status === 'CANCELLED') {
            clearInterval(checkInterval);
            dispatch(setFlowState('failed'));
            onError?.();
          }
        }
      } catch (err) {
        console.error('Status check failed:', err);
        if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          onError?.();
        }
      }
    }, 5000); // Check every 5 seconds

    // Clear interval after maximum checks
    const timeoutId = setTimeout(() => {
      clearInterval(checkInterval);
      if (checkCount >= maxChecks) {
        onError?.();
      }
    }, 600000); // 10 minutes

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeoutId);
    };
  }, [dispatch, paymentId, onComplete, onError, checkCount, maxChecks, router]);

  const getStatusIcon = () => {
    if (paymentStatus?.status === 'COMPLETED') {
      return <CheckCircle className="w-8 h-8 text-green-600" />;
    } else if (paymentStatus?.status === 'FAILED' || paymentStatus?.status === 'CANCELLED') {
      return <XCircle className="w-8 h-8 text-red-600" />;
    } else if (error) {
      return <AlertCircle className="w-8 h-8 text-orange-600" />;
    } else {
      return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    if (paymentStatus?.status === 'COMPLETED') {
      return "Payment completed successfully!";
    } else if (paymentStatus?.status === 'FAILED') {
      return "Payment failed. Please try again.";
    } else if (paymentStatus?.status === 'CANCELLED') {
      return "Payment was cancelled.";
    } else if (error) {
      return "Error checking payment status.";
    } else {
      return "Checking payment status...";
    }
  };

  const getProgressPercentage = () => {
    return Math.min((checkCount / maxChecks) * 100, 100);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-center mb-4">
        {getStatusIcon()}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
        Payment Status
      </h3>
      
      <p className="text-gray-600 text-center mb-4">
        {getStatusMessage()}
      </p>

      {!paymentStatus || paymentStatus.status === 'PENDING' ? (
        <div className="space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            Checking {checkCount} of {maxChecks} attempts
          </div>
          
          <div className="text-center text-xs text-gray-400">
            Please complete your payment on the JPesa page. This window will automatically update.
          </div>
        </div>
      ) : null}

      {paymentStatus?.reference && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Reference:</strong> {paymentStatus.reference}
          </p>
          {paymentStatus.jpesaMemo && (
            <p className="text-sm text-gray-600 mt-1">
              <strong>Payment ID:</strong> {paymentStatus.jpesaMemo}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
