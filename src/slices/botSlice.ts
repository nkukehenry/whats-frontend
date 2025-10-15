import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchBotResponsesThunk,
  createBotResponseThunk,
  updateBotResponseThunk,
  deleteBotResponseThunk,
  testBotResponseThunk,
  fetchBotTemplatesThunk,
} from './botThunks';

// Bot Response Types
export type TriggerType = 'EXACT_MATCH' | 'CONTAINS' | 'KEYWORD' | 'REGEX' | 'ALWAYS';
export type ResponseType = 'TEXT' | 'QUICK_REPLY' | 'INTERACTIVE' | 'MULTI_STEP' | 'CONDITIONAL';

export interface BotResponse {
  id: number;
  userId: number;
  deviceId: number;
  name: string;
  triggerType: TriggerType;
  triggerValue: string;
  responseType: ResponseType;
  responseData: QuickReplyData | MultiStepData | ConditionalData | string; // Typed based on responseType
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuickReplyButton {
  id: string;
  title: string;
  description?: string;
}

export interface QuickReplyData {
  header?: {
    type: 'text' | 'image' | 'video';
    text?: string;
    media?: string;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  buttons: QuickReplyButton[];
}

export interface MultiStepData {
  steps: {
    id: string;
    message: string;
    inputType: 'text' | 'button' | 'number' | 'email';
    validation?: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: string;
    };
    buttons?: {
      id: string;
      title: string;
      value: string;
    }[];
  }[];
}

export interface ConditionalData {
  conditions: {
    field: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
    value: string;
  }[];
  responses: {
    condition: string;
    response: string;
  }[];
}

export interface BotTemplate {
  name: string;
  triggerType: TriggerType;
  triggerValue: string;
  responseType: ResponseType;
  responseData: QuickReplyData | MultiStepData | ConditionalData | string;
}

export interface BotTemplates {
  quickReply: BotTemplate;
  multiStep: BotTemplate;
  conditional: BotTemplate;
}

export interface BotTestResult {
  response: BotResponse;
  processedResponse: {
    message: string;
    shouldCreateSession?: boolean;
    sessionData?: {
      currentStep: number;
      flowData: Record<string, unknown>;
    };
  };
  session: Record<string, unknown> | null;
}

interface BotState {
  responses: BotResponse[];
  templates: BotTemplates | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  testing: boolean;
  testResult: BotTestResult | null;
}

const initialState: BotState = {
  responses: [],
  templates: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  testing: false,
  testResult: null,
};

const botSlice = createSlice({
  name: 'bot',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTestResult: (state) => {
      state.testResult = null;
    },
    setResponses: (state, action: PayloadAction<BotResponse[]>) => {
      state.responses = action.payload;
    },
    addResponse: (state, action: PayloadAction<BotResponse>) => {
      state.responses.unshift(action.payload);
    },
    updateResponse: (state, action: PayloadAction<BotResponse>) => {
      const index = state.responses.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.responses[index] = action.payload;
      }
    },
    removeResponse: (state, action: PayloadAction<number>) => {
      state.responses = state.responses.filter(r => r.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Bot Responses
    builder
      .addCase(fetchBotResponsesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBotResponsesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.responses = action.payload;
        state.error = null;
      })
      .addCase(fetchBotResponsesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bot responses';
      });

    // Create Bot Response
    builder
      .addCase(createBotResponseThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createBotResponseThunk.fulfilled, (state, action) => {
        state.creating = false;
        state.responses.unshift(action.payload);
        state.error = null;
      })
      .addCase(createBotResponseThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Failed to create bot response';
      });

    // Update Bot Response
    builder
      .addCase(updateBotResponseThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateBotResponseThunk.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.responses.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.responses[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBotResponseThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || 'Failed to update bot response';
      });

    // Delete Bot Response
    builder
      .addCase(deleteBotResponseThunk.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteBotResponseThunk.fulfilled, (state, action) => {
        state.deleting = false;
        state.responses = state.responses.filter(r => r.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteBotResponseThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || 'Failed to delete bot response';
      });

    // Test Bot Response
    builder
      .addCase(testBotResponseThunk.pending, (state) => {
        state.testing = true;
        state.error = null;
      })
      .addCase(testBotResponseThunk.fulfilled, (state, action) => {
        state.testing = false;
        state.testResult = action.payload;
        state.error = null;
      })
      .addCase(testBotResponseThunk.rejected, (state, action) => {
        state.testing = false;
        state.error = action.payload || 'Failed to test bot response';
      });

    // Fetch Bot Templates
    builder
      .addCase(fetchBotTemplatesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBotTemplatesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
        state.error = null;
      })
      .addCase(fetchBotTemplatesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bot templates';
      });
  },
});

export const {
  clearError,
  clearTestResult,
  setResponses,
  addResponse,
  updateResponse,
  removeResponse,
} = botSlice.actions;

export default botSlice.reducer;
