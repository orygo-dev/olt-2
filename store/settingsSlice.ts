import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  appName: string;
  aiModel: string;
  aiApiConnection: string;
  logoUrl: string | null;
  splashBackgroundUrl: string | null;
}

const initialState: SettingsState = {
  appName: 'SmartOLT Monitor',
  aiModel: 'Model Analisis V1',
  aiApiConnection: '',
  logoUrl: null,
  splashBackgroundUrl: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setAppName: (state, action: PayloadAction<string>) => {
      state.appName = action.payload;
    },
    setAiModel: (state, action: PayloadAction<string>) => {
      state.aiModel = action.payload;
    },
    setAiApiConnection: (state, action: PayloadAction<string>) => {
      state.aiApiConnection = action.payload;
    },
    setLogoUrl: (state, action: PayloadAction<string | null>) => {
      state.logoUrl = action.payload;
    },
    setSplashBackgroundUrl: (state, action: PayloadAction<string | null>) => {
      state.splashBackgroundUrl = action.payload;
    },
  },
});

export const { setAppName, setAiModel, setAiApiConnection, setLogoUrl, setSplashBackgroundUrl } = settingsSlice.actions;
export default settingsSlice.reducer;
