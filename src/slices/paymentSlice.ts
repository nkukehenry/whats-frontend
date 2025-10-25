import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PaymentPlan, PaymentStatus, PaymentFormSubmission, PaymentFlowState } from '../types/payment';

interface PaymentState {
  plans: PaymentPlan[];
  currentPayment: PaymentFormSubmission | null;
  paymentStatus: PaymentStatus | null;
  flowState: PaymentFlowState;
  loading: boolean;
  error: string | null;
  registeringPayment: boolean;
  checkingStatus: boolean;
}

const initialState: PaymentState = {
  plans: [],
  currentPayment: null,
  paymentStatus: null,
  flowState: 'idle',
  loading: false,
  error: null,
  registeringPayment: false,
  checkingStatus: false,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFlowState: (state, action: PayloadAction<PaymentFlowState>) => {
      state.flowState = action.payload;
    },
    setPlans: (state, action: PayloadAction<PaymentPlan[]>) => {
      state.plans = action.payload;
    },
    setCurrentPayment: (state, action: PayloadAction<PaymentFormSubmission | null>) => {
      state.currentPayment = action.payload;
    },
    setPaymentStatus: (state, action: PayloadAction<PaymentStatus | null>) => {
      state.paymentStatus = action.payload;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
      state.paymentStatus = null;
      state.flowState = 'idle';
    },
  },
  extraReducers: (builder) => {
    // Note: We'll handle thunk results manually in components to avoid circular dependencies
    // This follows the same pattern as groupSlice.ts
  },
});

export const {
  clearError,
  setFlowState,
  setPlans,
  setCurrentPayment,
  setPaymentStatus,
  clearCurrentPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;
