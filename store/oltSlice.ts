import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OLT {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  snmpPort: number;
  snmpVersion: string;
  snmpCommunity: string;
  status: 'online' | 'offline';
  uptime: string;
  totalPorts: number;
  activePorts: number;
  createdAt: string;
}

interface OLTState {
  olts: OLT[];
}

const initialState: OLTState = {
  olts: [
    {
      id: '1',
      name: 'OLT-Central-01',
      location: 'Gedung Pusat Telekomunikasi',
      ipAddress: '192.168.1.100',
      snmpPort: 161,
      snmpVersion: 'v2c',
      snmpCommunity: 'public',
      status: 'online',
      uptime: '45 hari 12 jam',
      totalPorts: 16,
      activePorts: 14,
      createdAt: '2024-01-15T08:00:00Z',
    },
    {
      id: '2',
      name: 'OLT-West-02',
      location: 'Kantor Cabang Barat',
      ipAddress: '192.168.2.100',
      snmpPort: 161,
      snmpVersion: 'v2c',
      snmpCommunity: 'public',
      status: 'online',
      uptime: '30 hari 6 jam',
      totalPorts: 8,
      activePorts: 7,
      createdAt: '2024-02-01T10:30:00Z',
    },
  ],
};

const oltSlice = createSlice({
  name: 'olt',
  initialState,
  reducers: {
    addOLT: (state, action: PayloadAction<OLT>) => {
      state.olts.push(action.payload);
    },
    updateOLT: (state, action: PayloadAction<OLT>) => {
      const index = state.olts.findIndex(olt => olt.id === action.payload.id);
      if (index !== -1) {
        state.olts[index] = action.payload;
      }
    },
    deleteOLT: (state, action: PayloadAction<string>) => {
      state.olts = state.olts.filter(olt => olt.id !== action.payload);
    },
  },
});

export const { addOLT, updateOLT, deleteOLT } = oltSlice.actions;
export default oltSlice.reducer;
