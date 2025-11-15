"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import Sidebar from "../../../../components/Sidebar";
import { sendGroupMessageThunk } from "../../../../slices/groupThunks";
import { clearError } from "../../../../slices/groupSlice";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function GroupChatPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedGroups, sendingMessage, error } = useAppSelector((state) => state.groups);

  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const groupId = Number(params.id);
  const group = selectedGroups.find((g) => g.id === groupId);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !message.trim() || sendingMessage) return;

    setLocalError(null);
    setSuccessMessage(null);

    try {
      await dispatch(
        sendGroupMessageThunk({
          deviceId: group.deviceId,
          groupId: group.groupId,
          message: message.trim(),
        })
      ).unwrap();

      setSuccessMessage("Message sent to group successfully.");
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setLocalError("Failed to send message. Please try again.");
    }
  };

  const renderNotFound = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          activeTab="groups"
          showBackButton
          backButtonText="Back to Groups"
          onBackClick={() => router.push("/groups")}
        />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Group not found</h3>
              <p className="text-gray-600 mb-6">
                The group you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <button
                onClick={() => router.push("/groups")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Groups
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return null;
  }

  if (!group) {
    return renderNotFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          activeTab="groups"
          showBackButton
          backButtonText="Back to Groups"
          onBackClick={() => router.push("/groups")}
        />

        <div className="flex-1 p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold">
                  {group.groupName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{group.groupName}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{group.participantCount} participants</span>
                    </div>
                    <div className="text-gray-500">Device #{group.deviceId}</div>
                  </div>
                </div>
              </div>
              {group.groupDescription && (
                <div className="px-6 pb-6">
                  <p className="text-sm text-gray-600">{group.groupDescription}</p>
                </div>
              )}
            </div>

            {/* Status Alerts */}
            {successMessage && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMessage}</span>
              </div>
            )}
            {(localError || error) && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* Send Form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Send a Message</h2>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type the message you want to send to this group..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Messages are sent instantly via your connected device.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!message.trim() || sendingMessage}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

