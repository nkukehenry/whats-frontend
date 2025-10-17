"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import Sidebar from "../../../components/Sidebar";
import ApiBotWizard from "../../../components/ApiBotWizard";
import { 
  createApiBotConfigThunk, 
  updateApiBotConfigThunk,
  fetchApiBotConfigsThunk 
} from "../../../slices/apiBotThunks";
import { fetchDevicesThunk } from "../../../slices/deviceThunks";
import type { ApiBotFormData } from "../../../types/apiBot";

function CreateApiBotContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const { devices } = useAppSelector((state) => state.devices);
  const { configs, creating, updating } = useAppSelector((state) => state.apiBot);

  const editConfigId = searchParams.get('edit');
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [templateData, setTemplateData] = useState<Partial<ApiBotFormData> | null>(null);

  // Fetch devices when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchDevicesThunk());
    }
  }, [user, dispatch]);

  // Auto-select first device if available
  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices, selectedDeviceId]);

  // Fetch configs and populate form data when editing
  useEffect(() => {
    if (editConfigId && selectedDeviceId) {
      dispatch(fetchApiBotConfigsThunk({ deviceId: selectedDeviceId })).then(() => {
        const configToEdit = configs.find(c => c.id === parseInt(editConfigId));
        if (configToEdit) {
          setTemplateData({
            name: configToEdit.name,
            triggerText: configToEdit.triggerText,
            apiEndpoint: configToEdit.apiEndpoint,
            httpMethod: configToEdit.httpMethod,
            headers: Object.entries(configToEdit.headers).map(([key, value]) => ({ key, value })),
            customParams: Object.entries(configToEdit.customParams).map(([key, value]) => ({ key, value })),
            requestBody: configToEdit.requestBody ? JSON.stringify(configToEdit.requestBody, null, 2) : '',
            basicAuth: configToEdit.basicAuth,
            includeSender: configToEdit.includeSender,
            timeout: configToEdit.timeout,
          });
        }
      });
    }
  }, [editConfigId, selectedDeviceId, dispatch, configs]);

  const handleSave = async (formData: ApiBotFormData) => {
    if (!selectedDeviceId) return;

    try {
      // Convert form data to API format
      const apiData = {
        deviceId: selectedDeviceId,
        name: formData.name,
        triggerText: formData.triggerText,
        apiEndpoint: formData.apiEndpoint,
        httpMethod: formData.httpMethod,
        headers: formData.headers.reduce((acc, { key, value }) => {
          if (key && value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
        customParams: formData.customParams.reduce((acc, { key, value }) => {
          if (key && value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
        requestBody: formData.requestBody ? JSON.parse(formData.requestBody) : undefined,
        basicAuth: formData.basicAuth || undefined,
        includeSender: formData.includeSender,
        timeout: formData.timeout,
      };

      if (editConfigId) {
        await dispatch(updateApiBotConfigThunk({ 
          id: parseInt(editConfigId), 
          data: apiData 
        })).unwrap();
      } else {
        await dispatch(createApiBotConfigThunk(apiData)).unwrap();
      }

      router.push('/api-bot');
    } catch (err) {
      console.error('Failed to save API bot configuration:', err);
    }
  };

  const handleCancel = () => {
    router.push('/api-bot');
  };

  if (!selectedDeviceId) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activeTab="api-bot" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Device Selected</h2>
            <p className="text-gray-600">Please select a device first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="api-bot" />
      <div className="flex-1">
        <ApiBotWizard
          deviceId={selectedDeviceId}
          onSave={handleSave}
          onCancel={handleCancel}
          initialData={templateData || undefined}
          isLoading={creating || updating}
          title={editConfigId ? "Edit API Bot Configuration" : "Create API Bot Configuration"}
        />
      </div>
    </div>
  );
}

export default function CreateApiBotPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activeTab="api-bot" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <CreateApiBotContent />
    </Suspense>
  );
}
