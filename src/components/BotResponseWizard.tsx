"use client";
import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Save, MessageSquare, Zap, Settings, Users, Clock } from "lucide-react";
import { TriggerType, ResponseType, QuickReplyData, MultiStepData, ConditionalData } from "../slices/botSlice";
import ResponseContentBuilder from "./ResponseContentBuilder";
import ResponsePreview from "./ResponsePreview";

type FormData = {
  name: string;
  triggerType: TriggerType;
  triggerValue: string;
  responseType: ResponseType;
  responseData: QuickReplyData | MultiStepData | ConditionalData | string;
  priority: number;
};

interface BotResponseWizardProps {
  deviceId: number;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  initialData?: Partial<FormData>;
  isLoading?: boolean;
  title?: string;
}

const WIZARD_STEPS = [
  { id: 'basic', title: 'Basic Info', description: 'Response name and priority' },
  { id: 'trigger', title: 'Trigger Setup', description: 'When to activate the response' },
  { id: 'response', title: 'Response Type', description: 'Choose response type' },
  { id: 'builder', title: 'Response Builder', description: 'Configure response content' },
  { id: 'review', title: 'Review & Save', description: 'Review and save your response' },
];

export default function BotResponseWizard({
  deviceId,
  onSave,
  onCancel,
  initialData,
  isLoading = false,
  title = "Bot Response Wizard",
}: BotResponseWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    triggerType: initialData?.triggerType || 'KEYWORD' as TriggerType,
    triggerValue: initialData?.triggerValue || '',
    responseType: initialData?.responseType || 'TEXT' as ResponseType,
    responseData: initialData?.responseData || '',
    priority: initialData?.priority || 10,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = useCallback((field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateCurrentStep = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.name.trim()) {
          newErrors.name = 'Response name is required';
        }
        break;
      case 1: // Trigger Setup
        if (formData.triggerType !== 'ALWAYS' && !formData.triggerValue.trim()) {
          newErrors.triggerValue = 'Trigger value is required';
        }
        break;
      case 2: // Response Type
        // No validation needed - just selection
        break;
      case 3: // Response Builder
        if (formData.responseType === 'TEXT' && typeof formData.responseData === 'string' && !formData.responseData.trim()) {
          newErrors.responseData = 'Response text is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    }
  }, [validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleSave = useCallback(() => {
    if (validateCurrentStep()) {
      onSave(formData);
    }
  }, [validateCurrentStep, onSave, formData]);

  const canProceed = currentStep < WIZARD_STEPS.length - 1;
  const canGoBack = currentStep > 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">Create automated responses for your WhatsApp device</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index <= currentStep
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${
                  index <= currentStep ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {currentStep === 0 && (
          <BasicInfoStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        )}
        {currentStep === 1 && (
          <TriggerSetupStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        )}
        {currentStep === 2 && (
          <ResponseTypeStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        )}
        {currentStep === 3 && (
          <ResponseBuilderStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        )}
        {currentStep === 4 && (
          <ReviewStep
            formData={formData}
            deviceId={deviceId}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {canGoBack && (
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center gap-3">
          {canProceed && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {isLastStep && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function BasicInfoStep({ formData, errors, onInputChange }: {
  formData: FormData;
  errors: { [key: string]: string };
  onInputChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="e.g., Welcome Message"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) => onInputChange('priority', parseInt(e.target.value))}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Higher numbers have higher priority</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TriggerSetupStep({ formData, errors, onInputChange }: {
  formData: FormData;
  errors: { [key: string]: string };
  onInputChange: (field: string, value: unknown) => void;
}) {
  const TRIGGER_TYPES: { value: TriggerType; label: string; description: string }[] = [
    { value: 'EXACT_MATCH', label: 'Exact Match', description: 'Matches exact message text' },
    { value: 'CONTAINS', label: 'Contains', description: 'Message contains trigger text' },
    { value: 'KEYWORD', label: 'Keywords', description: 'Message contains any keyword' },
    { value: 'REGEX', label: 'Regex', description: 'Matches regular expression' },
    { value: 'ALWAYS', label: 'Always', description: 'Always triggers (fallback)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trigger Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Type
            </label>
            <select
              value={formData.triggerType}
              onChange={(e) => onInputChange('triggerType', e.target.value as TriggerType)}
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
                onChange={(e) => onInputChange('triggerValue', e.target.value)}
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
        </div>
      </div>
    </div>
  );
}

function ResponseTypeStep({ formData, onInputChange }: {
  formData: FormData;
  onInputChange: (field: string, value: unknown) => void;
}) {
  const RESPONSE_TYPES: { value: ResponseType; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'TEXT', label: 'Text', description: 'Simple text response', icon: MessageSquare },
    { value: 'QUICK_REPLY', label: 'Quick Reply', description: 'Interactive buttons', icon: Zap },
    { value: 'INTERACTIVE', label: 'Interactive', description: 'Interactive message', icon: Settings },
    { value: 'MULTI_STEP', label: 'Multi-Step', description: 'Conversation flow', icon: Users },
    { value: 'CONDITIONAL', label: 'Conditional', description: 'Condition-based responses', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Type</h3>
        <p className="text-gray-600 mb-6">Choose the type of response you want to create</p>
        
        <div className="grid grid-cols-1 gap-4">
          {RESPONSE_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => onInputChange('responseType', type.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.responseType === type.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-gray-600" />
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
  );
}

function ResponseBuilderStep({ formData, errors, onInputChange }: {
  formData: FormData;
  errors: { [key: string]: string };
  onInputChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Builder</h3>
        <p className="text-gray-600 mb-6">Configure your {formData.responseType.toLowerCase()} response</p>
        
        <ResponseContentBuilder
          responseType={formData.responseType}
          responseData={formData.responseData}
          errors={errors}
          onChange={(data) => onInputChange('responseData', data)}
        />
      </div>
    </div>
  );
}

function ReviewStep({ formData, deviceId }: { formData: FormData; deviceId: number }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Response</h3>
        
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Name</p>
              <p className="text-gray-900">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Priority</p>
              <p className="text-gray-900">{formData.priority}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Trigger Type</p>
              <p className="text-gray-900">{formData.triggerType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Trigger Value</p>
              <p className="text-gray-900">{formData.triggerValue || 'Always triggers'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Response Type</p>
              <p className="text-gray-900">{formData.responseType.replace('_', ' ')}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Response Preview</p>
            <div className="bg-white border rounded-lg p-4">
              <ResponsePreview responseType={formData.responseType} responseData={formData.responseData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

