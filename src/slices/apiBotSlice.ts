import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ApiBotConfig, ApiBotTestResult } from '../types/apiBot';
import { 
  fetchApiBotConfigsThunk,
  createApiBotConfigThunk,
  updateApiBotConfigThunk,
  deleteApiBotConfigThunk,
  testApiBotConfigThunk,
} from './apiBotThunks';

interface ApiBotState {
  configs: ApiBotConfig[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  testing: boolean;
  testResult: ApiBotTestResult | null;
}

const initialState: ApiBotState = {
  configs: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  testing: false,
  testResult: null,
};

const apiBotSlice = createSlice({
  name: 'apiBot',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTestResult: (state) => {
      state.testResult = null;
    },
    setConfigs: (state, action: PayloadAction<ApiBotConfig[]>) => {
      state.configs = action.payload;
    },
    addConfig: (state, action: PayloadAction<ApiBotConfig>) => {
      state.configs.unshift(action.payload);
    },
    updateConfig: (state, action: PayloadAction<ApiBotConfig>) => {
      const index = state.configs.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.configs[index] = action.payload;
      }
    },
    removeConfig: (state, action: PayloadAction<number>) => {
      state.configs = state.configs.filter(c => c.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch API Bot Configs
    builder
      .addCase(fetchApiBotConfigsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApiBotConfigsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.configs = action.payload;
      })
      .addCase(fetchApiBotConfigsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create API Bot Config
    builder
      .addCase(createApiBotConfigThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createApiBotConfigThunk.fulfilled, (state, action) => {
        state.creating = false;
        state.configs.unshift(action.payload);
      })
      .addCase(createApiBotConfigThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });

    // Update API Bot Config
    builder
      .addCase(updateApiBotConfigThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateApiBotConfigThunk.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.configs.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.configs[index] = action.payload;
        }
      })
      .addCase(updateApiBotConfigThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Delete API Bot Config
    builder
      .addCase(deleteApiBotConfigThunk.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteApiBotConfigThunk.fulfilled, (state, action) => {
        state.deleting = false;
        state.configs = state.configs.filter(c => c.id !== action.payload);
      })
      .addCase(deleteApiBotConfigThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });

    // Test API Bot Config
    builder
      .addCase(testApiBotConfigThunk.pending, (state) => {
        state.testing = true;
        state.error = null;
      })
      .addCase(testApiBotConfigThunk.fulfilled, (state, action) => {
        state.testing = false;
        state.testResult = action.payload;
      })
      .addCase(testApiBotConfigThunk.rejected, (state, action) => {
        state.testing = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearTestResult,
  setConfigs,
  addConfig,
  updateConfig,
  removeConfig,
} = apiBotSlice.actions;

export default apiBotSlice.reducer;
