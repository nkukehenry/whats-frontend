// Types for payment functionality

export interface PaymentPlan {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  features: string[];
  isPopular?: boolean;
  isFree?:boolean,
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFormData {
  action: string;
  ownerid: string;
  amount: number;
  cur: string;
  description: string;
  return: string;
  cancel: string;
}

export interface InitiatePaymentRequest {
  planId: number;
  mobile: string;
  description?: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: number;
    jpesaTid: string;
    jpesaMemo: string;
    message: string;
  };
}

export interface PaymentStatus {
  id: number;
  userId: number;
  planId: number;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  reference: string;
  description: string;
  jpesaMemo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  data: PaymentStatus;
}

export interface PaymentCallback {
  status: 'approved' | 'failed' | 'cancelled';
  memo?: string;
  ref?: string;
  amount?: number;
}

// Form submission types
export interface PaymentFormSubmission {
  paymentId: number;
  planId: number;
  planAmount: number;
  currency: string;
  description: string;
  formData: PaymentFormData;
}

// Payment flow states
export type PaymentFlowState = 'idle' | 'registering' | 'submitting' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Error types
export interface PaymentError {
  code: string;
  message: string;
  details?: string;
}
