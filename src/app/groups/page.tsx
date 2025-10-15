"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../hooks";
import Sidebar from "../../components/Sidebar";
import { 
  fetchSelectedGroupsThunk, 
  removeGroupThunk,
  updateGroupThunk
} from "../../slices/groupThunks";
import { clearError, setSelectedGroups } from "../../slices/groupSlice";
import type { SelectedGroup } from "../../types/group";
import {
  Users,
  Plus,
  Settings,
  Trash2,
  Edit,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";

export default function GroupsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { devices } = useAppSelector((state) => state.devices);
  const { 
    selectedGroups, 
    loading, 
    error 
  } = useAppSelector((state) => state.groups);

  const [editingGroup, setEditingGroup] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    groupName: "",
    groupDescription: "",
    isActive: true,
    autoReply: false,
  });

  useEffect(() => {
    if (user) {
      dispatch(fetchSelectedGroupsThunk()).then((result) => {
        if (fetchSelectedGroupsThunk.fulfilled.match(result)) {
          dispatch(setSelectedGroups(result.payload));
        }
      });
    }
  }, [user, dispatch]);

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

  const handleRemoveGroup = async (groupId: number) => {
    if (window.confirm('Are you sure you want to remove this group from monitoring? This action cannot be undone.')) {
      try {
        await dispatch(removeGroupThunk({ userGroupId: groupId })).unwrap();
      } catch (err) {
        console.error('Failed to remove group:', err);
      }
    }
  };

  const handleEditGroup = (group: SelectedGroup) => {
    setEditingGroup(group.id);
    setEditFormData({
      groupName: group.groupName,
      groupDescription: group.groupDescription,
      isActive: group.isActive,
      autoReply: group.autoReply,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingGroup) return;

    try {
      await dispatch(updateGroupThunk({
        userGroupId: editingGroup,
        ...editFormData,
      })).unwrap();
      setEditingGroup(null);
    } catch (err) {
      console.error('Failed to update group:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditFormData({
      groupName: "",
      groupDescription: "",
      isActive: true,
      autoReply: false,
    });
  };

  const handleRefresh = () => {
    dispatch(fetchSelectedGroupsThunk()).then((result) => {
      if (fetchSelectedGroupsThunk.fulfilled.match(result)) {
        dispatch(setSelectedGroups(result.payload));
      }
    });
  };

  const getDeviceName = (deviceId: number) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? `${device.name} (${device.waNumber})` : `Device ${deviceId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar activeTab="groups" />
        
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-600" />
                  Group Chats
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your WhatsApp groups and monitor conversations
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => router.push('/groups/add')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Groups
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
                  <span className="text-gray-600">Loading groups...</span>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && selectedGroups.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No groups selected</h3>
                <p className="text-gray-600 mb-6">
                  Start by adding groups from your devices to monitor conversations
                </p>
                <button
                  onClick={() => router.push('/groups/add')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Group
                </button>
              </div>
            )}

            {/* Groups List */}
            {!loading && selectedGroups.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {selectedGroups.map((group) => (
                  <div key={group.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    {/* Group Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {editingGroup === group.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editFormData.groupName}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, groupName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Group name"
                            />
                            <textarea
                              value={editFormData.groupDescription}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, groupDescription: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Group description"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {group.groupName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {group.groupDescription || 'No description'}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {editingGroup === group.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                              title="Save"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                              title="Cancel"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            {/*<button
                              onClick={() => router.push(`/groups/${group.id}/chat`)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Open Chat"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>*/}
                            <button
                              onClick={() => handleEditGroup(group)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                              title="Edit Group"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveGroup(group.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Remove Group"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Group Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Smartphone className="w-4 h-4" />
                        <span>{getDeviceName(group.deviceId)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{group.participantCount} participants</span>
                      </div>

                      <div className="text-xs text-gray-500">
                        Added on {formatDate(group.createdAt)}
                      </div>
                    </div>

                    {/* Group Settings */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {group.isActive ? (
                            <ToggleRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {group.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {group.autoReply ? (
                            <ToggleRight className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-600">
                            Auto Reply {group.autoReply ? 'On' : 'Off'}
                          </span>
                        </div>
                      </div>

                      {editingGroup === group.id && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`active-${group.id}`}
                              checked={editFormData.isActive}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <label htmlFor={`active-${group.id}`} className="text-xs text-gray-600">
                              Active
                            </label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`autoReply-${group.id}`}
                              checked={editFormData.autoReply}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, autoReply: e.target.checked }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`autoReply-${group.id}`} className="text-xs text-gray-600">
                              Auto Reply
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
