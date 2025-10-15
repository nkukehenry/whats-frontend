"use client";
import React from "react";
import type { ResponseType, QuickReplyData, MultiStepData, ConditionalData } from "../slices/botSlice";

interface ResponsePreviewProps {
  responseType: ResponseType;
  responseData: QuickReplyData | MultiStepData | ConditionalData | string;
}

export default function ResponsePreview({ responseType, responseData }: ResponsePreviewProps) {
  switch (responseType) {
    case 'TEXT':
      return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm text-gray-900">
            {typeof responseData === 'string' ? responseData : 'No text provided'}
          </pre>
        </div>
      );

    case 'QUICK_REPLY':
      const quickReplyData = responseData as QuickReplyData;
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
                {quickReplyData.buttons.map((button, index: number) => (
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
      const multiStepData = responseData as MultiStepData;
      return (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            Multi-step conversation flow with {multiStepData?.steps?.length || 0} steps:
          </p>
          
          {multiStepData?.steps && multiStepData.steps.length > 0 && (
            <div className="space-y-3">
              {multiStepData.steps.map((step, index: number) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Step {index + 1}: {step.inputType} input
                      </p>
                      <p className="text-sm text-gray-700 mb-2">{step.message}</p>
                      
                      {step.inputType === 'button' && step.buttons && step.buttons.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">Button options:</p>
                          <div className="flex flex-wrap gap-1">
                            {step.buttons.map((button, btnIndex: number) => (
                              <span key={btnIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {button.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {step.validation && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">Validation:</p>
                          <div className="flex flex-wrap gap-1">
                            {step.validation.required && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Required</span>
                            )}
                            {step.validation.minLength && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                Min: {step.validation.minLength}
                              </span>
                            )}
                            {step.validation.maxLength && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                Max: {step.validation.maxLength}
                              </span>
                            )}
                            {step.validation.pattern && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                Pattern
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'CONDITIONAL':
      const conditionalData = responseData as ConditionalData;
      return (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            Conditional responses based on message content
          </p>
          
          {conditionalData?.responses && conditionalData.responses.length > 0 && (
            <div className="space-y-2">
              {conditionalData.responses.map((response, index: number) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Condition: {response.condition}
                  </p>
                  <p className="text-sm text-gray-700">{response.response}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'INTERACTIVE':
      return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">Interactive message preview</p>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">No preview available</p>
        </div>
      );
  }
}
