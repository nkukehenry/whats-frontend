"use client";
import React, { useState } from "react";
import {
  MessageSquare,
  Zap,
  Users,
  Clock,
  Copy,
  Plus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { BotTemplate, TriggerType, ResponseType } from "../slices/botSlice";

interface BotTemplatesProps {
  templates: { quickReply: BotTemplate; multiStep: BotTemplate; conditional: BotTemplate } | null;
  onUseTemplate: (template: BotTemplate) => void;
  isLoading?: boolean;
  selectedDeviceId?: number | null;
}

export default function BotTemplates({ templates, onUseTemplate, isLoading = false, selectedDeviceId }: BotTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const templateIcons = {
    quickReply: Zap,
    multiStep: Users,
    conditional: Clock,
  };

  const templateDescriptions = {
    quickReply: "Interactive message with quick reply buttons for user selection",
    multiStep: "Multi-step conversation flow to collect information",
    conditional: "Condition-based responses that change based on message content",
  };

  const handleUseTemplate = (templateType: string, template: BotTemplate) => {
    setSelectedTemplate(templateType);
    onUseTemplate(template);
  };

  const handleCopyTemplate = (templateType: string) => {
    setCopiedTemplate(templateType);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const renderTemplatePreview = (template: BotTemplate, type: string) => {
    switch (type) {
      case 'quickReply':
        const quickReplyData = template.responseData as { header?: { text?: string }; body?: { text?: string }; buttons?: { title: string }[] };
        return (
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {quickReplyData?.header?.text || "Quick Reply Message"}
              </p>
              <p className="text-sm text-gray-600">
                {quickReplyData?.body?.text || "Please select an option:"}
              </p>
            </div>
            <div className="flex gap-2">
              {quickReplyData?.buttons?.slice(0, 2).map((button: { title: string }, index: number) => (
                <div key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  {button.title}
                </div>
              ))}
              {quickReplyData?.buttons && quickReplyData.buttons.length > 2 && (
                <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{quickReplyData.buttons.length - 2} more
                </div>
              )}
            </div>
          </div>
        );

      case 'multiStep':
        const multiStepData = template.responseData as { steps?: { message: string }[] };
        return (
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">Multi-Step Flow</p>
              <p className="text-sm text-gray-600">
                {multiStepData?.steps?.length || 0} conversation steps
              </p>
            </div>
            <div className="space-y-1">
              {multiStepData?.steps?.slice(0, 2).map((step: { message: string }, index: number) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="truncate">{step.message}</span>
                </div>
              ))}
              {multiStepData?.steps && multiStepData.steps.length > 2 && (
                <div className="text-xs text-gray-500 ml-6">
                  +{multiStepData.steps.length - 2} more steps
                </div>
              )}
            </div>
          </div>
        );

      case 'conditional':
        const conditionalData = template.responseData as { responses?: { condition: string; response: string }[] };
        return (
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">Conditional Response</p>
              <p className="text-sm text-gray-600">
                {conditionalData?.responses?.length || 0} different responses
              </p>
            </div>
            <div className="space-y-1">
              {conditionalData?.responses?.slice(0, 2).map((response: { condition: string; response: string }, index: number) => (
                <div key={index} className="text-xs text-gray-600">
                  <span className="font-medium">{response.condition}:</span> {response.response.substring(0, 50)}...
                </div>
              ))}
              {conditionalData?.responses && conditionalData.responses.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{conditionalData.responses.length - 2} more conditions
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Template preview not available</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Templates</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading templates...</span>
        </div>
      </div>
    );
  }

  if (!templates) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Templates</h3>
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>No templates available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Response Templates</h3>
        <p className="text-sm text-gray-600">Pre-built response templates to get started quickly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Reply Template */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Quick Reply</h4>
              <p className="text-xs text-gray-600">Interactive buttons</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {templateDescriptions.quickReply}
          </p>

          {renderTemplatePreview(templates.quickReply, 'quickReply')}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleUseTemplate('quickReply', templates.quickReply)}
              disabled={!selectedDeviceId}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!selectedDeviceId ? "Please select a device first" : ""}
            >
              <Plus className="w-4 h-4" />
              Use Template
            </button>
            <button
              onClick={() => handleCopyTemplate('quickReply')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy template"
            >
              {copiedTemplate === 'quickReply' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Multi-Step Template */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Multi-Step</h4>
              <p className="text-xs text-gray-600">Conversation flow</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {templateDescriptions.multiStep}
          </p>

          {renderTemplatePreview(templates.multiStep, 'multiStep')}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleUseTemplate('multiStep', templates.multiStep)}
              disabled={!selectedDeviceId}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!selectedDeviceId ? "Please select a device first" : ""}
            >
              <Plus className="w-4 h-4" />
              Use Template
            </button>
            <button
              onClick={() => handleCopyTemplate('multiStep')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy template"
            >
              {copiedTemplate === 'multiStep' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Conditional Template */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Conditional</h4>
              <p className="text-xs text-gray-600">Smart responses</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {templateDescriptions.conditional}
          </p>

          {renderTemplatePreview(templates.conditional, 'conditional')}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleUseTemplate('conditional', templates.conditional)}
              disabled={!selectedDeviceId}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!selectedDeviceId ? "Please select a device first" : ""}
            >
              <Plus className="w-4 h-4" />
              Use Template
            </button>
            <button
              onClick={() => handleCopyTemplate('conditional')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy template"
            >
              {copiedTemplate === 'conditional' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Template Usage Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Template Usage Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Templates provide a starting point - customize them for your needs</li>
          <li>• Quick Reply templates work great for customer support menus</li>
          <li>• Multi-Step templates are perfect for lead generation and surveys</li>
          <li>• Conditional templates help provide personalized responses</li>
          <li>• Always test your responses before activating them</li>
        </ul>
      </div>
    </div>
  );
}
