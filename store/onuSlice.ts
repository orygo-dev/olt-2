import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ONU {
  id: string;
  oltId: string;
  oltName: string;
  name: string;
  serialNumber: string;
  macAddress: string;
  ipAddress: string;
  status: 'online' | 'offline';
  signalStrength: number;
  distance: string;
  port: string;
  vlan: number;
  mode: 'pppoe' | 'bridge';
  pppoeUsername?: string;
  pppoePassword?: string;
  portBinding: string[];
  wlan: {
    ssid: string;
    security: 'open' | 'password';
    password?: string;
  };
  uptime: string;
  lastSeen: string;
  estimatedBreakLocation?: string;
}

interface ONUState {
  onus: ONU[];
}

const initialState: ONUState = {
  onus: [
    {
      id: '1',
      oltId: '1',
      oltName: 'OLT-Central-01',
      name: 'ONU-Customer-001',
      serialNumber: 'HWTC12345678',
      macAddress: '00:11:22:33:44:55',
      ipAddress: '192.168.100.10',
      status: 'online',
      signalStrength: -22,
      distance: '1.2 km',
      port: 'PON 0/1/1',
      vlan: 100,
      mode: 'pppoe',
      pppoeUsername: 'user001@isp.net',
      pppoePassword: 'password123',
      portBinding: ['LAN1', 'LAN2'],
      wlan: {
        ssid: 'WiFi-Customer-001',
        security: 'password',
        password: 'wifi123456',
      },
      uptime: '15 hari 8 jam',
      lastSeen: '2025-01-10T14:30:00Z',
    },
    {
      id: '2',
      oltId: '1',
      oltName: 'OLT-Central-01',
      name: 'ONU-Customer-002',
      serialNumber: 'HWTC87654321',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      ipAddress: '192.168.100.11',
      status: 'online',
      signalStrength: -25,
      distance: '2.5 km',
      port: 'PON 0/1/2',
      vlan: 100,
      mode: 'bridge',
      portBinding: ['LAN1', 'LAN2', 'LAN3', 'LAN4'],
      wlan: {
        ssid: 'Home-Network-002',
        security: 'password',
        password: 'secure2025',
      },
      uptime: '22 hari 3 jam',
      lastSeen: '2025-01-10T14:28:00Z',
    },
    {
      id: '3',
      oltId: '2',
      oltName: 'OLT-West-02',
      name: 'ONU-Customer-003',
      serialNumber: 'HWTC11223344',
      macAddress: '11:22:33:44:55:66',
      ipAddress: '192.168.100.12',
      status: 'offline',
      signalStrength: -28,
      distance: '3.1 km',
      port: 'PON 0/2/1',
      vlan: 200,
      mode: 'pppoe',
      pppoeUsername: 'user003@isp.net',
      pppoePassword: 'pass2025',
      portBinding: ['LAN1'],
      wlan: {
        ssid: 'MyWiFi-003',
        security: 'open',
      },
      uptime: '0 hari 0 jam',
      lastSeen: '2025-01-09T22:15:00Z',
    },
  ],
};

const onuSlice = createSlice({
  name: 'onu',
  initialState,
  reducers: {
    addONU: (state, action: PayloadAction<ONU>) => {
      state.onus.push(action.payload);
    },
    updateONU: (state, action: PayloadAction<ONU>) => {
      const index = state.onus.findIndex(onu => onu.id === action.payload.id);
      if (index !== -1) {
        state.onus[index] = action.payload;
      }
    },
    deleteONU: (state, action: PayloadAction<string>) => {
      state.onus = state.onus.filter(onu => onu.id !== action.payload);
    },
  },
});

export const { addONU, updateONU, deleteONU } = onuSlice.actions;
export default onuSlice.reducer;
