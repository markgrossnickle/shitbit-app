/**
 * Device store — manages BLE device connection state.
 */
import { create } from 'zustand';
import { DeviceStatus, type ShitBitDevice } from '@/src/services/ble';

interface DeviceStore {
  /** Currently connected device, if any. */
  connectedDevice: ShitBitDevice | null;
  /** Current connection status. */
  status: DeviceStatus;
  /** Devices found during the most recent scan. */
  scanResults: ShitBitDevice[];
  /** Whether a scan is currently in progress. */
  scanning: boolean;
  /** Last error message from BLE operations. */
  error: string | null;
  /** ID of the device the user has paired with (persisted). */
  pairedDeviceId: string | null;

  /** Update connection status. */
  setStatus: (status: DeviceStatus) => void;
  /** Set the connected device. */
  setConnectedDevice: (device: ShitBitDevice | null) => void;
  /** Add a device found during scanning. */
  addScanResult: (device: ShitBitDevice) => void;
  /** Clear scan results (before starting a new scan). */
  clearScanResults: () => void;
  /** Set scanning state. */
  setScanning: (scanning: boolean) => void;
  /** Record a BLE error. */
  setError: (error: string | null) => void;
  /** Store the paired device ID. */
  setPairedDeviceId: (id: string | null) => void;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  connectedDevice: null,
  status: DeviceStatus.Disconnected,
  scanResults: [],
  scanning: false,
  error: null,
  pairedDeviceId: null,

  setStatus: (status) => set({ status }),

  setConnectedDevice: (device) =>
    set({
      connectedDevice: device,
      status: device ? DeviceStatus.Connected : DeviceStatus.Disconnected,
    }),

  addScanResult: (device) =>
    set((state) => {
      // Update existing entry or add new one
      const existing = state.scanResults.findIndex((d) => d.id === device.id);
      if (existing !== -1) {
        const updated = [...state.scanResults];
        updated[existing] = device;
        return { scanResults: updated };
      }
      return { scanResults: [...state.scanResults, device] };
    }),

  clearScanResults: () => set({ scanResults: [] }),

  setScanning: (scanning) => set({ scanning }),

  setError: (error) => set({ error }),

  setPairedDeviceId: (id) => set({ pairedDeviceId: id }),
}));
