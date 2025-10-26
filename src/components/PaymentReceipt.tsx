"use client";
import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, CheckCircle } from "lucide-react";

interface PaymentReceiptProps {
  isOpen: boolean;
  plan: {
    id: number;
    name: string;
    priceCents: number;
    messageLimit: number;
    deviceLimit: number;
    apiAccess: boolean;
    period: string;
    basicBotLimit: number;
    apiBotLimit: number;
  };
  monthsCount: number;
  paymentId: number;
  onClose: () => void;
}

export default function PaymentReceipt({
  isOpen,
  plan,
  monthsCount,
  paymentId,
  onClose,
}: PaymentReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `payment-receipt-${paymentId}-${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (!isOpen) return null;

  const totalAmount = plan.priceCents * monthsCount;
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl border border-white/20"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-700">Payment Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="bg-white p-8 rounded-lg shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-700 mb-2">Alpha Meals</h1>
            <p className="text-gray-600">WhatsApp Automation Platform</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Payment Successful</span>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt ID:</span>
                  <span className="font-medium">#{paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{currentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{monthsCount} {monthsCount === 1 ? 'Month' : 'Months'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Message Limit:</span>
                  <span className="font-medium">{plan.messageLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Device Limit:</span>
                  <span className="font-medium">{plan.deviceLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Access:</span>
                  <span className="font-medium">{plan.apiAccess ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Basic Bots:</span>
                  <span className="font-medium">{plan.basicBotLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium Bots:</span>
                  <span className="font-medium">{plan.apiBotLimit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Rate per Month:</span>
                <span className="font-medium">UGX {plan.priceCents.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{monthsCount} {monthsCount === 1 ? 'Month' : 'Months'}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
                <span className="text-lg font-semibold text-green-800">Total Amount:</span>
                <span className="text-xl font-bold text-green-900">UGX {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Thank you for choosing Alpha Meals!</p>
            <p className="mt-2">This receipt serves as proof of payment for your subscription.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={generatePDF}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download PDF Receipt
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
