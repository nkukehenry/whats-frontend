"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import Sidebar from "../../../components/Sidebar";
import { 
  fetchAvailableGroupsThunk,
  selectGroupThunk 
} from "../../../slices/groupThunks";
import { clearError, setAvailableGroups } from "../../../slices/groupSlice";
import {
  Users,
  ArrowLeft,
  Smartphone,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  MessageSquare,
  Settings,
  Loader2,
} from "lucide-react";

export default function AddGroupsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { devices } = useAppSelector((state) => state.devices);
  const { 
    availableGroups,
    fetchingGroups,
    selectingGroup,
    error 
  } = useAppSelector((state) => state.groups);

  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);

  useEffect(() => {
    if (user && devices.length > 0) {
      // Auto-select first device if available
      if (!selectedDeviceId) {
        setSelectedDeviceId(devices[0].id);
      }
    }
  }, [user, devices, selectedDeviceId]);

  useEffect(() => {
    if (selectedDeviceId) {
      dispatch(fetchAvailableGroupsThunk({ deviceId: selectedDeviceId })).then((result) => {
        if (fetchAvailableGroupsThunk.fulfilled.match(result)) {
          dispatch(setAvailableGroups(result.payload.availableGroups));
        }
      });
    }
  }, [selectedDeviceId, dispatch]);

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

  const handleDeviceChange = (deviceId: number) => {
    setSelectedDeviceId(deviceId);
    setSelectedGroups(new Set());
    setSearchTerm("");
  };

  const handleRefreshGroups = () => {
    if (selectedDeviceId) {
      dispatch(fetchAvailableGroupsThunk({ deviceId: selectedDeviceId })).then((result) => {
        if (fetchAvailableGroupsThunk.fulfilled.match(result)) {
          dispatch(setAvailableGroups(result.payload.availableGroups));
        }
      });
    }
  };

  const handleGroupToggle = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const handleSelectGroups = async () => {
    if (!selectedDeviceId || selectedGroups.size === 0) return;

    const selectedGroupsData = Array.from(selectedGroups).map(groupId => {
      const group = availableGroups.find(g => g.id === groupId);
      return group;
    }).filter(Boolean);

    try {
      // Select each group
      for (const group of selectedGroupsData) {
        if (group) {
          await dispatch(selectGroupThunk({
            deviceId: selectedDeviceId,
            groupId: group.id,
            groupName: group.name,
            groupDescription: group.description,
            participantCount: group.participantCount,
            autoReply: autoReplyEnabled,
          })).unwrap();
        }
      }
      
      // Redirect to groups page
      router.push('/groups');
    } catch (err) {
      console.error('Failed to select groups:', err);
    }
  };

  const filteredGroups = availableGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDeviceName = (deviceId: number) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? `${device.name} (${device.waNumber})` : `Device ${deviceId}`;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar activeTab="groups" showBackButton backButtonText="Back to Groups" onBackClick={() => router.push('/groups')} />
        
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-600" />
                  Add Groups
                </h1>
                <p className="text-gray-600 mt-2">
                  Select WhatsApp groups from your devices to monitor conversations
                </p>
              </div>
              
              <button
                onClick={() => router.push('/groups')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Groups
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Device Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                Select Device
              </h2>
              
              <select
                value={selectedDeviceId || ""}
                onChange={(e) => handleDeviceChange(Number(e.target.value))}
                className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Choose a device...</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.waNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Groups List */}
            {selectedDeviceId && (
              <div className="bg-white rounded-xl border border-gray-200">
                {/* Groups Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      Available Groups from {getDeviceName(selectedDeviceId)}
                    </h2>
                    
                    <button
                      onClick={handleRefreshGroups}
                      disabled={fetchingGroups}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${fetchingGroups ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search groups..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Global Settings */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="autoReply"
                        checked={autoReplyEnabled}
                        onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="autoReply" className="text-sm text-gray-700">
                        Enable auto-reply for selected groups
                      </label>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {fetchingGroups && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                      <span className="text-gray-600">Loading groups from WhatsApp...</span>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!fetchingGroups && filteredGroups.length === 0 && (
                  <div className="text-center py-12">
                    {availableGroups.length === 0 ? (
                      <>
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
                        <p className="text-gray-600 mb-6">
                          No WhatsApp groups are available from this device. Make sure the device is connected and has groups.
                        </p>
                      </>
                    ) : (
                      <>
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No groups match your search</h3>
                        <p className="text-gray-600 mb-6">
                          Try adjusting your search terms or clear the search to see all groups.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Groups List */}
                {!fetchingGroups && filteredGroups.length > 0 && (
                  <div className="p-6">
                    <div className="space-y-4">
                      {filteredGroups.map((group) => {
                        const isSelected = selectedGroups.has(group.id);
                        return (
                          <div
                            key={group.id}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleGroupToggle(group.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleGroupToggle(group.id)}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {group.name}
                                  </h3>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3 ml-6">
                                  {group.description || 'No description available'}
                                </p>
                                
                                <div className="flex items-center gap-4 ml-6 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <UserCheck className="w-4 h-4" />
                                    <span>{group.participantCount} participants</span>
                                  </div>
                                </div>
                              </div>
                              
                              {isSelected && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Settings className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selection Summary */}
                    {selectedGroups.size > 0 && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900">
                              {selectedGroups.size} group{selectedGroups.size !== 1 ? 's' : ''} selected
                            </p>
                            <p className="text-xs text-green-700">
                              These groups will be added to your monitoring list
                            </p>
                          </div>
                          
                          <button
                            onClick={handleSelectGroups}
                            disabled={selectingGroup}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {selectingGroup ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Add Selected Groups
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* No Device Selected */}
            {!selectedDeviceId && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Device</h3>
                <p className="text-gray-600">
                  Choose a device from the dropdown above to see available WhatsApp groups
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
