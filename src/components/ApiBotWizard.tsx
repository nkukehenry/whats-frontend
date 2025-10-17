"use client";
import React, { useState, useCallback } from "react";
import { 
  Code, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Loader2,
  Info,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
} from "lucide-react";
import type { ApiBotFormData } from "../types/apiBot";
import { API_BOT_PLACEHOLDERS } from "../types/apiBot";

interface ApiBotWizardProps {
  deviceId: number;
  onSave: (data: ApiBotFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ApiBotFormData>;
  isLoading?: boolean;
  title?: string;
}

const WIZARD_STEPS = [
  { id: 'basic', title: 'Basic Info', description: 'Name and trigger configuration' },
  { id: 'endpoint', title: 'API Endpoint', description: 'Configure the API endpoint and method' },
  { id: 'auth', title: 'Authentication', description: 'Set up authentication if needed' },
  { id: 'request', title: 'Request Configuration', description: 'Headers, parameters, and body' },
  { id: 'review', title: 'Review & Save', description: 'Review and save your configuration' },
];

export default function ApiBotWizard({
  deviceId,
  onSave,
  onCancel,
  initialData,
  isLoading = false,
  title = "API Bot Configuration Wizard",
}: ApiBotWizardProps) {
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApiBotFormData>({
    name: initialData?.name || '',
    triggerText: initialData?.triggerText || '',
    apiEndpoint: initialData?.apiEndpoint || '',
    httpMethod: initialData?.httpMethod || 'POST',
    headers: initialData?.headers || [{ key: '', value: '' }],
    customParams: initialData?.customParams || [{ key: '', value: '' }],
    requestBody: initialData?.requestBody || '',
    basicAuth: initialData?.basicAuth || null,
    includeSender: initialData?.includeSender || false,
    timeout: initialData?.timeout || 5000,
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
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.triggerText.trim()) newErrors.triggerText = 'Trigger text is required';
        break;
      case 1: // API Endpoint
        if (!formData.apiEndpoint.trim()) newErrors.apiEndpoint = 'API endpoint is required';
        if (!formData.apiEndpoint.startsWith('http://') && !formData.apiEndpoint.startsWith('https://')) {
          newErrors.apiEndpoint = 'API endpoint must start with http:// or https://';
        }
        break;
      case 3: // Request Configuration
        if (formData.requestBody && formData.httpMethod !== 'GET') {
          try {
            JSON.parse(formData.requestBody);
          } catch {
            newErrors.requestBody = 'Request body must be valid JSON';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData]);

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = () => {
    if (validateCurrentStep()) {
      onSave(formData);
    }
  };

  const addHeader = () => {
    handleInputChange('headers', [...formData.headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...formData.headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    handleInputChange('headers', newHeaders);
  };

  const removeHeader = (index: number) => {
    const newHeaders = formData.headers.filter((_, i) => i !== index);
    handleInputChange('headers', newHeaders);
  };

  const addCustomParam = () => {
    handleInputChange('customParams', [...formData.customParams, { key: '', value: '' }]);
  };

  const updateCustomParam = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...formData.customParams];
    newParams[index] = { ...newParams[index], [field]: value };
    handleInputChange('customParams', newParams);
  };

  const removeCustomParam = (index: number) => {
    const newParams = formData.customParams.filter((_, i) => i !== index);
    handleInputChange('customParams', newParams);
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('requestBody') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.requestBody;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      handleInputChange('requestBody', newText);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
        textarea.focus();
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Code className="w-7 h-7 text-green-600" />
              {title}
            </h1>
            <p className="text-gray-600 mt-1">
              Step {currentStep + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep].description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-4" />
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
            <EndpointStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 2 && (
            <AuthenticationStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 3 && (
            <RequestConfigStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              onAddHeader={addHeader}
              onUpdateHeader={updateHeader}
              onRemoveHeader={removeHeader}
              onAddCustomParam={addCustomParam}
              onUpdateCustomParam={updateCustomParam}
              onRemoveCustomParam={removeCustomParam}
              onInsertPlaceholder={insertPlaceholder}
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
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            {currentStep === WIZARD_STEPS.length - 1 ? (
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function BasicInfoStep({ 
  formData, 
  errors, 
  onInputChange 
}: {
  formData: ApiBotFormData;
  errors: { [key: string]: string };
  onInputChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <p className="text-gray-600 mb-6">
          Configure the basic details for your API bot configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Configuration Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="e.g., Weather Bot, ChatGPT Bot"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trigger Text *
          </label>
          <input
            type="text"
            value={formData.triggerText}
            onChange={(e) => onInputChange('triggerText', e.target.value)}
            placeholder="e.g., weather, ai, support"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.triggerText ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.triggerText && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.triggerText}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            The text that will trigger this API bot when received in a message
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeout (milliseconds)
          </label>
          <input
            type="number"
            value={formData.timeout}
            onChange={(e) => onInputChange('timeout', parseInt(e.target.value) || 5000)}
            min="1000"
            max="30000"
            step="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            How long to wait for the API response (1-30 seconds)
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeSender"
            checked={formData.includeSender}
            onChange={(e) => onInputChange('includeSender', e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="includeSender" className="ml-2 block text-sm text-gray-700">
            Include sender information in API calls
          </label>
        </div>
      </div>
    </div>
  );
}

function EndpointStep({ 
  formData, 
  errors, 
  onInputChange 
}: {
  formData: ApiBotFormData;
  errors: { [key: string]: string };
  onInputChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoint Configuration</h2>
        <p className="text-gray-600 mb-6">
          Configure the external API endpoint that will be called when the trigger text is received.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HTTP Method *
          </label>
          <select
            value={formData.httpMethod}
            onChange={(e) => onInputChange('httpMethod', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Endpoint URL *
          </label>
          <input
            type="url"
            value={formData.apiEndpoint}
            onChange={(e) => onInputChange('apiEndpoint', e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.apiEndpoint ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.apiEndpoint && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.apiEndpoint}
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">API Endpoint Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use HTTPS endpoints for security</li>
              <li>• Ensure the endpoint accepts the HTTP method you select</li>
              <li>• Test your endpoint manually before configuring the bot</li>
              <li>• Consider rate limits and API quotas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthenticationStep({ 
  formData, 
  errors, 
  onInputChange 
}: {
  formData: ApiBotFormData;
  errors: { [key: string]: string };
  onInputChange: (field: string, value: unknown) => void;
}) {
  const [enableBasicAuth, setEnableBasicAuth] = useState(!!formData.basicAuth);

  const handleBasicAuthToggle = (enabled: boolean) => {
    setEnableBasicAuth(enabled);
    if (enabled) {
      onInputChange('basicAuth', { username: '', password: '' });
    } else {
      onInputChange('basicAuth', null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h2>
        <p className="text-gray-600 mb-6">
          Configure authentication for your API endpoint if required.
        </p>
      </div>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Basic Authentication</h3>
              <p className="text-xs text-gray-600">Username and password authentication</p>
            </div>
            <input
              type="checkbox"
              checked={enableBasicAuth}
              onChange={(e) => handleBasicAuthToggle(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>

          {enableBasicAuth && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.basicAuth?.username || ''}
                  onChange={(e) => onInputChange('basicAuth', {
                    ...formData.basicAuth,
                    username: e.target.value
                  })}
                  placeholder="API username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.basicAuth?.password || ''}
                  onChange={(e) => onInputChange('basicAuth', {
                    ...formData.basicAuth,
                    password: e.target.value
                  })}
                  placeholder="API password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Authentication Security</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Credentials are stored securely and encrypted</li>
                <li>• Consider using API keys in headers instead of basic auth when possible</li>
                <li>• Test your authentication before saving the configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestConfigStep({ 
  formData, 
  errors, 
  onInputChange,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
  onAddCustomParam,
  onUpdateCustomParam,
  onRemoveCustomParam,
  onInsertPlaceholder,
}: {
  formData: ApiBotFormData;
  errors: { [key: string]: string };
  onInputChange: (field: string, value: unknown) => void;
  onAddHeader: () => void;
  onUpdateHeader: (index: number, field: 'key' | 'value', value: string) => void;
  onRemoveHeader: (index: number) => void;
  onAddCustomParam: () => void;
  onUpdateCustomParam: (index: number, field: 'key' | 'value', value: string) => void;
  onRemoveCustomParam: (index: number) => void;
  onInsertPlaceholder: (placeholder: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Configuration</h2>
        <p className="text-gray-600 mb-6">
          Configure headers, parameters, and request body for your API calls.
        </p>
      </div>

      {/* Headers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Headers</h3>
          <button
            onClick={onAddHeader}
            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Header
          </button>
        </div>
        <div className="space-y-3">
          {formData.headers.map((header, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={header.key}
                onChange={(e) => onUpdateHeader(index, 'key', e.target.value)}
                placeholder="Header name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => onUpdateHeader(index, 'value', e.target.value)}
                placeholder="Header value"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                onClick={() => onRemoveHeader(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Parameters */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Custom Parameters</h3>
          <button
            onClick={onAddCustomParam}
            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Parameter
          </button>
        </div>
        <div className="space-y-3">
          {formData.customParams.map((param, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={param.key}
                onChange={(e) => onUpdateCustomParam(index, 'key', e.target.value)}
                placeholder="Parameter name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="text"
                value={param.value}
                onChange={(e) => onUpdateCustomParam(index, 'value', e.target.value)}
                placeholder="Parameter value"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                onClick={() => onRemoveCustomParam(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Request Body */}
      {formData.httpMethod !== 'GET' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Request Body (JSON)</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Insert placeholders:</span>
              {Object.values(API_BOT_PLACEHOLDERS).map((placeholder) => (
                <button
                  key={placeholder}
                  onClick={() => onInsertPlaceholder(placeholder)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                >
                  {placeholder}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="requestBody"
            value={formData.requestBody}
            onChange={(e) => onInputChange('requestBody', e.target.value)}
            placeholder='{"message": "{{message}}", "user": "{{sender}}"}'
            rows={8}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm ${
              errors.requestBody ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.requestBody && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.requestBody}
            </p>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Available Placeholders</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <code className="bg-blue-100 px-1 rounded">&#123;&#123;message&#125;&#125;</code> - The user&apos;s input text</li>
              <li>• <code className="bg-blue-100 px-1 rounded">&#123;&#123;sender&#125;&#125;</code> - The sender&apos;s phone number</li>
              <li>• <code className="bg-blue-100 px-1 rounded">&#123;&#123;timestamp&#125;&#125;</code> - Current timestamp in ISO format</li>
              <li>• <code className="bg-blue-100 px-1 rounded">&#123;&#123;deviceId&#125;&#125;</code> - The device ID</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ 
  formData, 
  deviceId 
}: {
  formData: ApiBotFormData;
  deviceId: number;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Configuration</h2>
        <p className="text-gray-600 mb-6">
          Review your API bot configuration before saving.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {formData.name}</div>
              <div><span className="font-medium">Trigger:</span> <code className="bg-gray-200 px-1 rounded">{formData.triggerText}</code></div>
              <div><span className="font-medium">Timeout:</span> {formData.timeout}ms</div>
              <div><span className="font-medium">Include Sender:</span> {formData.includeSender ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">API Configuration</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Method:</span> {formData.httpMethod}</div>
              <div><span className="font-medium">Endpoint:</span> <code className="bg-gray-200 px-1 rounded text-xs break-all">{formData.apiEndpoint}</code></div>
              <div><span className="font-medium">Authentication:</span> {formData.basicAuth ? 'Basic Auth' : 'None'}</div>
              <div><span className="font-medium">Headers:</span> {formData.headers.filter(h => h.key && h.value).length} configured</div>
              <div><span className="font-medium">Parameters:</span> {formData.customParams.filter(p => p.key && p.value).length} configured</div>
            </div>
          </div>
        </div>

        {formData.httpMethod !== 'GET' && formData.requestBody && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Request Body</h3>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
              {formData.requestBody}
            </pre>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">Ready to Save</h3>
              <p className="text-sm text-green-700">
                Your API bot configuration is ready. Click &quot;Save Configuration&quot; to create the bot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
