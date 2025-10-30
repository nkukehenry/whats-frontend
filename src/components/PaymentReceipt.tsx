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
  startDate?: string;
  endDate?: string;
  onClose: () => void;
}

export default function PaymentReceipt({
  isOpen,
  plan,
  monthsCount,
  paymentId,
  startDate,
  endDate,
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
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Force all elements to use standard colors
          const clonedElement = clonedDoc.querySelector('[data-receipt-pdf]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.color = '#000000';
            clonedElement.style.backgroundColor = '#ffffff';
          }
        },
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

  const currentDate = startDate 
    ? new Date(startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
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
          <h2 className="text-2xl font-bold" style={{ color: '#15803d' }}>Payment Receipt</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold"
            style={{ color: '#6b7280' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            ×
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} data-receipt-pdf className="bg-white p-8 rounded-lg shadow-lg" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#15803d' }}>Bulkoms</h1>
            <p style={{ color: '#4b5563' }}>WhatsApp Automation Platform</p>
            <p className="text-sm mt-1" style={{ color: '#6b7280' }}>https://bulkoms.com</p>
            <div className="mt-4 flex items-center justify-center gap-2" style={{ color: '#16a34a' }}>
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Payment Successful</span>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Payment Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#4b5563' }}>Receipt ID:</span>
                  <span className="font-medium" style={{ color: '#000000' }}>#{paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#4b5563' }}>Date:</span>
                  <span className="font-medium" style={{ color: '#000000' }}>{currentDate}</span>
                </div>
                {startDate && (
                  <div className="flex justify-between">
                    <span style={{ color: '#4b5563' }}>Start Date:</span>
                    <span className="font-medium" style={{ color: '#000000' }}>{new Date(startDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                )}
                {endDate && (
                  <div className="flex justify-between">
                    <span style={{ color: '#4b5563' }}>End Date:</span>
                    <span className="font-medium" style={{ color: '#000000' }}>{new Date(endDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: '#4b5563' }}>Plan:</span>
                  <span className="font-medium" style={{ color: '#000000' }}>{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#4b5563' }}>Duration:</span>
                  <span className="font-medium" style={{ color: '#000000' }}>{monthsCount} {monthsCount === 1 ? 'Month' : 'Months'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Plan Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#4b5563' }}>Message Limit:</span>
                  <span className="font-medium" style={{ color: '#000000' }}>{plan.messageLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#4b5563' }}>Device Limit:</span>
                  <span className="font-medium" style={{ color: '#000000' }}>{plan.deviceLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#4b5563' }}>API Access:</span>
                  <span className="font-medium" style={{ color: '#000000' }}>{plan.apiAccess ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#4b5563' }}>Basic Bots:</span>
                  <span className="font-medium" style={{ color: '#000000' }}>{plan.basicBotLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#4b5563' }}>Premium Bots:</span>
                  <span className="font-medium" style={{ color: '#000000' }}>{plan.apiBotLimit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t pt-6" style={{ borderTopColor: '#e5e7eb' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Pricing Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b px-4" style={{ borderBottomColor: '#e5e7eb' }}>
                <span style={{ color: '#4b5563' }}>Rate per Month:</span>
                <span className="font-medium" style={{ color: '#000000' }}>${(plan.priceCents / 3500).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b px-4" style={{ borderBottomColor: '#e5e7eb' }}>
                <span style={{ color: '#4b5563' }}>Duration:</span>
                <span className="font-medium" style={{ color: '#000000' }}>{monthsCount} {monthsCount === 1 ? 'Month' : 'Months'}</span>
              </div>
              <div className="flex justify-between items-center py-3 rounded-lg px-4" style={{ backgroundColor: '#f0fdf4' }}>
                <span className="text-lg font-semibold" style={{ color: '#166534' }}>Total Amount:</span>
                <span className="text-xl font-bold" style={{ color: '#14532d' }}>${((plan.priceCents * monthsCount) / 3500).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm" style={{ color: '#6b7280' }}>
            <p>Thank you for choosing Bulkoms!</p>
            <p className="mt-2">This receipt serves as proof of payment for your subscription.</p>
            <p className="mt-2 text-xs">Visit us at https://bulkoms.com</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={generatePDF}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#16a34a' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
          >
            <Download className="w-5 h-5" />
            Download PDF Receipt
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border rounded-lg transition-colors"
            style={{ borderColor: '#d1d5db', color: '#374151' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
