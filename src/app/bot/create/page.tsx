"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { createBotResponseThunk, updateBotResponseThunk, fetchBotResponsesThunk } from "../../../slices/botThunks";
import { fetchDevicesThunk } from "../../../slices/deviceThunks";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import BotResponseWizard from "../../../components/BotResponseWizard";
import { AlertCircle, Loader2 } from "lucide-react";
import type { 
  TriggerType, 
  ResponseType, 
  QuickReplyData, 
  MultiStepData, 
  ConditionalData 
} from "../../../slices/botSlice";

function CreateBotResponseContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const { devices } = useAppSelector((state) => state.devices);
  const { creating, error, responses } = useAppSelector((state) => state.bot);

  const [deviceId, setDeviceId] = useState<number | null>(null);
  const [editResponseId, setEditResponseId] = useState<number | null>(null);
  const [templateData, setTemplateData] = useState<Partial<{
    name: string;
    triggerType: TriggerType;
    triggerValue: string;
    responseType: ResponseType;
    responseData: QuickReplyData | MultiStepData | ConditionalData | string;
    priority: number;
  }> | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  // Get deviceId, template, and edit params from URL
  useEffect(() => {
    const deviceIdParam = searchParams.get('deviceId');
    const templateParam = searchParams.get('template');
    const editParam = searchParams.get('edit');
    
    if (deviceIdParam) {
      setDeviceId(parseInt(deviceIdParam));
    }
    
    if (editParam) {
      setEditResponseId(parseInt(editParam));
    }
    
    if (templateParam) {
      try {
        const template = JSON.parse(decodeURIComponent(templateParam));
        setTemplateData(template);
      } catch (err) {
        console.error('Failed to parse template data:', err);
      }
    }
  }, [searchParams]);

  // Fetch devices when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchDevicesThunk());
    }
  }, [user, dispatch]);

  // Auto-select device if only one available
  useEffect(() => {
    if (devices.length === 1 && !deviceId) {
      setDeviceId(devices[0].id);
    }
  }, [devices, deviceId]);

  // Fetch bot responses if editing
  useEffect(() => {
    if (editResponseId && deviceId) {
      dispatch(fetchBotResponsesThunk({ deviceId }));
    }
  }, [editResponseId, deviceId, dispatch]);

  // Load existing response data when editing
  useEffect(() => {
    if (editResponseId && responses.length > 0) {
      const existingResponse = responses.find(r => r.id === editResponseId);
      if (existingResponse) {
        setTemplateData({
          name: existingResponse.name,
          triggerType: existingResponse.triggerType,
          triggerValue: existingResponse.triggerValue,
          responseType: existingResponse.responseType,
          responseData: existingResponse.responseData,
          priority: existingResponse.priority,
        });
        if (!deviceId) {
          setDeviceId(existingResponse.deviceId);
        }
      }
    }
  }, [editResponseId, responses, deviceId]);

  const handleSave = async (data: {
    name: string;
    triggerType: TriggerType;
    triggerValue: string;
    responseType: ResponseType;
    responseData: QuickReplyData | MultiStepData | ConditionalData | string;
    priority: number;
  }) => {
    if (!deviceId) return;

    try {
      if (editResponseId) {
        // Update existing response
        await dispatch(updateBotResponseThunk({
          id: editResponseId,
          ...data,
        })).unwrap();
      } else {
        // Create new response
        await dispatch(createBotResponseThunk({
          deviceId,
          ...data,
        })).unwrap();
      }
      
      // Redirect to bot page on success
      router.push('/bot');
    } catch (err) {
      // Error is handled by Redux
      console.error('Failed to save bot response:', err);
    }
  };

  const handleCancel = () => {
    router.push('/bot');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!deviceId) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activeTab="bot" />
        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Device Selected</h3>
              <p className="text-gray-600 mb-4">
                Please select a device to create a bot response.
              </p>
              <button
                onClick={() => router.push('/bot')}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Back to Bot Management
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="bot" />
      
      <div className="flex-1">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {creating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              <span className="text-gray-700">Creating bot response...</span>
            </div>
          </div>
        )}

        <BotResponseWizard
          deviceId={deviceId}
          onSave={handleSave}
          onCancel={handleCancel}
          initialData={templateData || undefined}
          isLoading={creating}
          title={editResponseId ? 'Edit Bot Response' : 'Create Bot Response'}
        />
      </div>
    </div>
  );
}

export default function CreateBotResponsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CreateBotResponseContent />
    </Suspense>
  );
}
