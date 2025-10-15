"use client";
import React from "react";
import { CheckCircle, Copy, MessageSquare, Zap, Users, Clock, Settings } from "lucide-react";
import type { BotTestResult, ResponseType, QuickReplyData, MultiStepData } from "../slices/botSlice";

interface TestResultRendererProps {
  testResult: BotTestResult;
  onCopyResult?: (text: string) => void;
}

export default function TestResultRenderer({ testResult, onCopyResult }: TestResultRendererProps) {
  const { response, processedResponse } = testResult;

  const renderResponsePreview = () => {
    switch (response.responseType) {
      case 'TEXT':
        return (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-900">
              {processedResponse.message}
            </pre>
          </div>
        );

      case 'QUICK_REPLY':
        const quickReplyData = response.responseData as QuickReplyData;
        return (
          <div className="space-y-3">
            {quickReplyData?.header?.text && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  {quickReplyData.header.text}
                </p>
              </div>
            )}
            
            {quickReplyData?.body?.text && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-900">
                  {quickReplyData.body.text}
                </p>
              </div>
            )}
            
            {quickReplyData?.buttons && quickReplyData.buttons.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600">Quick Reply Options:</p>
                <div className="grid grid-cols-1 gap-2">
                  {quickReplyData.buttons.map((button, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-green-900">{button.title}</p>
                        {button.description && (
                          <p className="text-xs text-green-700">{button.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {quickReplyData?.footer?.text && (
              <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 italic">
                  {quickReplyData.footer.text}
                </p>
              </div>
            )}
          </div>
        );

      case 'MULTI_STEP':
        const multiStepData = response.responseData as MultiStepData;
        const currentStepIndex = processedResponse.sessionData?.currentStep || 0;
        const currentStep = multiStepData?.steps?.[currentStepIndex];
        
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Multi-Step Flow - Step {currentStepIndex + 1} of {multiStepData?.steps?.length || 0}
                </span>
              </div>
              <p className="text-sm text-blue-800">
                {processedResponse.message}
              </p>
            </div>

            {currentStep && (
              <div className="space-y-3">
                {/* Current Step Message */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-900">{currentStep.message}</p>
                </div>

                {/* Step Buttons */}
                {currentStep.inputType === 'button' && currentStep.buttons && currentStep.buttons.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Available Options:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {currentStep.buttons.map((button, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                          <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">{button.title}</p>
                            <p className="text-xs text-green-700">Value: {button.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      User can reply with the number or button value to proceed
                    </p>
                  </div>
                )}

                {/* Step Validation */}
                {currentStep.validation && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs font-medium text-yellow-800 mb-1">Validation Rules:</p>
                    <div className="flex flex-wrap gap-1">
                      {currentStep.validation.required && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Required</span>
                      )}
                      {currentStep.validation.minLength && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          Min: {currentStep.validation.minLength}
                        </span>
                      )}
                      {currentStep.validation.maxLength && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          Max: {currentStep.validation.maxLength}
                        </span>
                      )}
                      {currentStep.validation.pattern && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          Pattern
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Session Data */}
            {processedResponse.sessionData && (
              <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-1">Session Info:</p>
                <div className="text-xs text-gray-600">
                  <p>Current Step: {processedResponse.sessionData.currentStep}</p>
                  <p>Should Create Session: {processedResponse.shouldCreateSession ? 'Yes' : 'No'}</p>
                  {Object.keys(processedResponse.sessionData.flowData).length > 0 && (
                    <p>Flow Data: {JSON.stringify(processedResponse.sessionData.flowData)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'CONDITIONAL':
        return (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-900">
                {processedResponse.message}
              </pre>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-800">
                Conditional response based on message content matching
              </p>
            </div>
          </div>
        );

      case 'INTERACTIVE':
        return (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-900">
                {processedResponse.message}
              </pre>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-800">
                Interactive message with enhanced functionality
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-900">
              {processedResponse.message}
            </pre>
          </div>
        );
    }
  };

  const getResponseTypeIcon = (type: ResponseType) => {
    switch (type) {
      case 'TEXT': return MessageSquare;
      case 'QUICK_REPLY': return Zap;
      case 'INTERACTIVE': return Settings;
      case 'MULTI_STEP': return Users;
      case 'CONDITIONAL': return Clock;
      default: return MessageSquare;
    }
  };

  const ResponseIcon = getResponseTypeIcon(response.responseType);

  return (
    <div className="space-y-4">
      {/* Success Message */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-800">Response Matched!</span>
        </div>
        <p className="text-sm text-green-700">
          The bot response was triggered successfully.
        </p>
      </div>

      {/* Response Type Info */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <ResponseIcon className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {response.responseType.replace('_', ' ')} Response
        </span>
      </div>

      {/* Response Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Response Preview:</p>
          {onCopyResult && (
            <button
              onClick={() => onCopyResult(processedResponse.message)}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              title="Copy result"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>
        {renderResponsePreview()}
      </div>

      {/* Session Data */}
      {testResult.session && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Session Data:</p>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <pre className="text-xs text-gray-600">
              {JSON.stringify(testResult.session, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

