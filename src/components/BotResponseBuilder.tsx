"use client";
import React, { useState, useCallback } from "react";
import {
  MessageSquare,
  Zap,
  Settings,
  Users,
  Clock,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  AlertCircle,
} from "lucide-react";
import type { 
  TriggerType, 
  ResponseType, 
  QuickReplyData, 
  QuickReplyButton,
  MultiStepData, 
  ConditionalData 
} from "../slices/botSlice";

interface BotResponseBuilderProps {
  deviceId: number;
  onSave: (data: {
    name: string;
    triggerType: TriggerType;
    triggerValue: string;
    responseType: ResponseType;
    responseData: QuickReplyData | MultiStepData | ConditionalData | string;
    priority: number;
  }) => void;
  onCancel: () => void;
  initialData?: Partial<{
    name: string;
    triggerType: TriggerType;
    triggerValue: string;
    responseType: ResponseType;
    responseData: QuickReplyData | MultiStepData | ConditionalData | string;
    priority: number;
  }>;
  isLoading?: boolean;
}

interface DragItem {
  type: 'trigger' | 'response';
  id: string;
  content: unknown;
}

const TRIGGER_TYPES: { value: TriggerType; label: string; description: string }[] = [
  { value: 'EXACT_MATCH', label: 'Exact Match', description: 'Matches exact message text' },
  { value: 'CONTAINS', label: 'Contains', description: 'Message contains trigger text' },
  { value: 'KEYWORD', label: 'Keywords', description: 'Message contains any keyword' },
  { value: 'REGEX', label: 'Regex', description: 'Matches regular expression' },
  { value: 'ALWAYS', label: 'Always', description: 'Always triggers (fallback)' },
];

const RESPONSE_TYPES: { value: ResponseType; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'TEXT', label: 'Text', description: 'Simple text response', icon: MessageSquare },
  { value: 'QUICK_REPLY', label: 'Quick Reply', description: 'Interactive buttons', icon: Zap },
  { value: 'INTERACTIVE', label: 'Interactive', description: 'Interactive message', icon: Settings },
  { value: 'MULTI_STEP', label: 'Multi-Step', description: 'Conversation flow', icon: Users },
  { value: 'CONDITIONAL', label: 'Conditional', description: 'Condition-based responses', icon: Clock },
];

export default function BotResponseBuilder({
  deviceId,
  onSave,
  onCancel,
  initialData,
  isLoading = false,
}: BotResponseBuilderProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    triggerType: initialData?.triggerType || 'KEYWORD' as TriggerType,
    triggerValue: initialData?.triggerValue || '',
    responseType: initialData?.responseType || 'TEXT' as ResponseType,
    responseData: initialData?.responseData || '',
    priority: initialData?.priority || 10,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Response name is required';
    }

    if (formData.triggerType !== 'ALWAYS' && !formData.triggerValue.trim()) {
      newErrors.triggerValue = 'Trigger value is required';
    }

    if (formData.responseType === 'TEXT' && typeof formData.responseData === 'string' && !formData.responseData.trim()) {
      newErrors.responseData = 'Response text is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form changes
  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetType: 'trigger' | 'response') => {
    e.preventDefault();
    if (draggedItem && draggedItem.type === targetType) {
      // Handle the drop logic here
      console.log(`Dropped ${draggedItem.type} item:`, draggedItem.content);
    }
    setDraggedItem(null);
  };

  // Handle save
  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Render trigger configuration
  const renderTriggerConfig = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Trigger Configuration</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trigger Type
        </label>
        <select
          value={formData.triggerType}
          onChange={(e) => handleInputChange('triggerType', e.target.value as TriggerType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {TRIGGER_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label} - {type.description}
            </option>
          ))}
        </select>
      </div>

      {formData.triggerType !== 'ALWAYS' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trigger Value
            {formData.triggerType === 'KEYWORD' && (
              <span className="text-xs text-gray-500 ml-1">(comma-separated keywords)</span>
            )}
            {formData.triggerType === 'REGEX' && (
              <span className="text-xs text-gray-500 ml-1">(regular expression)</span>
            )}
          </label>
          <input
            type="text"
            value={formData.triggerValue}
            onChange={(e) => handleInputChange('triggerValue', e.target.value)}
            placeholder={
              formData.triggerType === 'KEYWORD' 
                ? 'hello,hi,hey,good morning'
                : formData.triggerType === 'REGEX'
                ? '^\\d{10}$'
                : 'Enter trigger text'
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.triggerValue && (
            <p className="text-red-600 text-sm mt-1">{errors.triggerValue}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <input
          type="number"
          value={formData.priority}
          onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <p className="text-xs text-gray-500 mt-1">Higher numbers have higher priority</p>
      </div>
    </div>
  );

  // Render response configuration
  const renderResponseConfig = () => {
    switch (formData.responseType) {
      case 'TEXT':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Text Response</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Text
              </label>
              <textarea
                value={typeof formData.responseData === 'string' ? formData.responseData : ''}
                onChange={(e) => handleInputChange('responseData', e.target.value)}
                placeholder="Enter your response text..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.responseData && (
                <p className="text-red-600 text-sm mt-1">{errors.responseData}</p>
              )}
            </div>
          </div>
        );

      case 'QUICK_REPLY':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Reply Response</h3>
            <QuickReplyBuilder
              data={formData.responseType === 'QUICK_REPLY' ? formData.responseData as QuickReplyData : undefined}
              onChange={(data) => handleInputChange('responseData', data)}
            />
          </div>
        );

      case 'MULTI_STEP':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Multi-Step Response</h3>
            <MultiStepBuilder
              data={formData.responseType === 'MULTI_STEP' ? formData.responseData as MultiStepData : undefined}
              onChange={(data) => handleInputChange('responseData', data)}
            />
          </div>
        );

      case 'CONDITIONAL':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Conditional Response</h3>
            <ConditionalBuilder
              data={formData.responseType === 'CONDITIONAL' ? formData.responseData as ConditionalData : undefined}
              onChange={(data) => handleInputChange('responseData', data)}
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>Response type not implemented yet</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bot Response Builder</h2>
        <p className="text-gray-600">Create automated responses for your WhatsApp device</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Welcome Message"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {renderTriggerConfig()}
          </div>

          {/* Response Type Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Type</h3>
            <div className="grid grid-cols-1 gap-3">
              {RESPONSE_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('responseType', type.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.responseType === type.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Response Builder */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {renderResponseConfig()}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 mt-8">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Response
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Quick Reply Builder Component
function QuickReplyBuilder({ data, onChange }: { data: QuickReplyData | undefined; onChange: (data: QuickReplyData) => void }) {
  const [quickReplyData, setQuickReplyData] = useState<QuickReplyData>(data || {
    body: { text: '' },
    buttons: [],
  });

  const updateData = (updates: Partial<QuickReplyData>) => {
    const newData = { ...quickReplyData, ...updates };
    setQuickReplyData(newData);
    onChange(newData);
  };

  const addButton = () => {
    const newButton = {
      id: `btn_${Date.now()}`,
      title: '',
      description: '',
    };
    updateData({
      buttons: [...quickReplyData.buttons, newButton],
    });
  };

  const updateButton = (index: number, updates: Partial<QuickReplyButton>) => {
    const newButtons = [...quickReplyData.buttons];
    newButtons[index] = { ...newButtons[index], ...updates };
    updateData({ buttons: newButtons });
  };

  const removeButton = (index: number) => {
    const newButtons = quickReplyData.buttons.filter((_, i) => i !== index);
    updateData({ buttons: newButtons });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Header Text (Optional)
        </label>
        <input
          type="text"
          value={quickReplyData.header?.text || ''}
          onChange={(e) => updateData({ header: { type: 'text', text: e.target.value } })}
          placeholder="Welcome! How can I help you?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Body Text
        </label>
        <textarea
          value={quickReplyData.body.text}
          onChange={(e) => updateData({ body: { text: e.target.value } })}
          placeholder="Please select an option:"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Footer Text (Optional)
        </label>
        <input
          type="text"
          value={quickReplyData.footer?.text || ''}
          onChange={(e) => updateData({ footer: { text: e.target.value } })}
          placeholder="Reply with the number of your choice"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Quick Reply Buttons
          </label>
          <button
            onClick={addButton}
            className="text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Button
          </button>
        </div>

        <div className="space-y-3">
          {quickReplyData.buttons.map((button, index) => (
            <div key={button.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Button {index + 1}</span>
                <button
                  onClick={() => removeButton(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={button.title}
                  onChange={(e) => updateButton(index, { title: e.target.value })}
                  placeholder="Button title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={button.description || ''}
                  onChange={(e) => updateButton(index, { description: e.target.value })}
                  placeholder="Button description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Multi-Step Builder Component
function MultiStepBuilder({ data, onChange }: { data: MultiStepData | undefined; onChange: (data: MultiStepData) => void }) {
  const [multiStepData, setMultiStepData] = useState<MultiStepData>(data || {
    steps: [],
  });

  const updateData = (updates: Partial<MultiStepData>) => {
    const newData = { ...multiStepData, ...updates };
    setMultiStepData(newData);
    onChange(newData);
  };

  const addStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      message: '',
      inputType: 'text' as const,
      validation: { required: true },
    };
    updateData({
      steps: [...multiStepData.steps, newStep],
    });
  };

  const updateStep = (index: number, updates: Partial<MultiStepData['steps'][0]>) => {
    const newSteps = [...multiStepData.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    updateData({ steps: newSteps });
  };

  const removeStep = (index: number) => {
    const newSteps = multiStepData.steps.filter((_, i) => i !== index);
    updateData({ steps: newSteps });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900">Conversation Steps</h4>
        <button
          onClick={addStep}
          className="text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      </div>

      <div className="space-y-4">
        {multiStepData.steps.map((step, index) => (
          <div key={step.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Step {index + 1}</span>
              <button
                onClick={() => removeStep(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={step.message}
                  onChange={(e) => updateStep(index, { message: e.target.value })}
                  placeholder="What message should be sent?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Type
                </label>
                <select
                  value={step.inputType}
                  onChange={(e) => updateStep(index, { inputType: e.target.value as 'text' | 'button' | 'number' | 'email' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="button">Button</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Conditional Builder Component
function ConditionalBuilder({ data, onChange }: { data: ConditionalData | undefined; onChange: (data: ConditionalData) => void }) {
  const [conditionalData, setConditionalData] = useState<ConditionalData>(data || {
    conditions: [],
    responses: [],
  });

  const updateData = (updates: Partial<ConditionalData>) => {
    const newData = { ...conditionalData, ...updates };
    setConditionalData(newData);
    onChange(newData);
  };

  return (
    <div className="space-y-4">
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Conditional response builder coming soon</p>
      </div>
    </div>
  );
}
