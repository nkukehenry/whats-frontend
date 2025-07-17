"use client";
import React, { useEffect, useState } from "react";
import { fetchPublicPlans, subscribeToPlan } from "../../utils/api";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setSubscription } from "../../slices/authSlice";

export interface Plan {
  id: number;
  name: string;
  priceCents: number;
  messageLimit: number;
  deviceLimit: number;
  apiAccess: boolean;
  period: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { subscription } = useAppSelector((state) => state.auth);
  const currentPlanId = (subscription as { plan?: { id?: number } })?.plan?.id;

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center border border-gray-200 hover:shadow-2xl transition-shadow"
              >
                <h2 className="text-xl font-bold text-green-700 mb-2">{plan.name}</h2>
                <div className="text-3xl font-extrabold text-gray-900 mb-4">
                  ${(plan.priceCents / 100).toFixed(2)}
                  <span className="text-base font-medium text-gray-500 ml-1">/ {plan.period}</span>
                </div>
                <ul className="text-gray-700 text-sm mb-6 space-y-1 w-full">
                  <li><span className="font-medium">Message Limit:</span> {plan.messageLimit}</li>
                  <li><span className="font-medium">Device Limit:</span> {plan.deviceLimit}</li>
                  <li><span className="font-medium">API Access:</span> {plan.apiAccess ? "Yes" : "No"}</li>
                </ul>
                {currentPlanId === plan.id ? (
                  <span className="mt-auto bg-green-100 text-green-700 px-6 py-2 rounded-lg font-semibold w-full text-center cursor-default border border-green-300">Current</span>
                ) : (
                  <button
                    className="mt-auto bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={subscribing === plan.id}
                    onClick={async () => {
                      setSubscribing(plan.id);
                      setError(null);
                      try {
                        const res = await subscribeToPlan(plan.id);
                        dispatch(setSubscription(res.data));
                        setSuccess("Subscribed!");
                      } catch (err: unknown) {
                        if (err && typeof err === 'object' && 'message' in err) {
                          setError((err as { message?: string }).message || "Failed to subscribe");
                        } else {
                          setError("Failed to subscribe");
                        }
                      } finally {
                        setSubscribing(null);
                      }
                    }}
                  >
                    {subscribing === plan.id ? "Subscribing..." : "Select"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 