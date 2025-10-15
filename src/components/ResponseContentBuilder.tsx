"use client";
import React from "react";
import { AlertCircle } from "lucide-react";
import type { ResponseType, QuickReplyData, MultiStepData, ConditionalData } from "../slices/botSlice";
import QuickReplyBuilder from "./QuickReplyBuilder";
import MultiStepBuilder from "./MultiStepBuilder";
import ConditionalBuilder from "./ConditionalBuilder";

interface ResponseContentBuilderProps {
  responseType: ResponseType;
  responseData: QuickReplyData | MultiStepData | ConditionalData | string;
  errors: { [key: string]: string };
  onChange: (data: QuickReplyData | MultiStepData | ConditionalData | string) => void;
}

export default function ResponseContentBuilder({
  responseType,
  responseData,
  errors,
  onChange,
}: ResponseContentBuilderProps) {
  switch (responseType) {
    case 'TEXT':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Text
            </label>
            <textarea
              value={typeof responseData === 'string' ? responseData : ''}
              onChange={(e) => onChange(e.target.value)}
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
        <QuickReplyBuilder
          data={responseType === 'QUICK_REPLY' ? responseData as QuickReplyData : undefined}
          onChange={onChange}
        />
      );

    case 'MULTI_STEP':
      return (
        <MultiStepBuilder
          data={responseType === 'MULTI_STEP' ? responseData as MultiStepData : undefined}
          onChange={onChange}
        />
      );

    case 'CONDITIONAL':
      return (
        <ConditionalBuilder
          data={responseType === 'CONDITIONAL' ? responseData as ConditionalData : undefined}
          onChange={onChange}
        />
      );

    case 'INTERACTIVE':
      return (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Interactive response builder coming soon</p>
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
}
