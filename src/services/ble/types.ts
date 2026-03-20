/** A ShitBit device discovered during BLE scanning. */
export interface ShitBitDevice {
  /** BLE peripheral ID */
  id: string;
  /** Advertised device name (e.g. "ShitBit-A3F2") */
  name: string;
  /** Signal strength in dBm */
  rssi: number;
}

/**
 * A weigh session as received from the BLE device.
 * This is the raw data before being stored as a Session.
 */
export interface WeighSession {
  /** Weight in grams when user sat down */
  sitWeight: number;
  /** Weight in grams when user stood up */
  standWeight: number;
  /** Computed delta: sitWeight - standWeight */
  delta: number;
  /** Timestamp from the device (epoch ms) */
  timestamp: number;
  /** Battery level 0-100 */
  batteryLevel: number;
}

/** Connection status of the BLE device. */
export enum DeviceStatus {
  /** No device connected */
  Disconnected = 'disconnected',
  /** Currently establishing connection */
  Connecting = 'connecting',
  /** Connected and idle */
  Connected = 'connected',
  /** Connected and actively receiving measurement data */
  Measuring = 'measuring',
}

/** UUIDs for the ShitBit BLE service and characteristics. */
export const BLE_CONSTANTS = {
  /** The primary service UUID advertised by ShitBit devices */
  SERVICE_UUID: '0000FFE0-0000-1000-8000-00805F9B34FB',
  /** Characteristic for receiving weigh session data */
  WEIGH_CHARACTERISTIC_UUID: '0000FFE1-0000-1000-8000-00805F9B34FB',
  /** Characteristic for reading battery level */
  BATTERY_CHARACTERISTIC_UUID: '0000FFE2-0000-1000-8000-00805F9B34FB',
  /** Characteristic for device info (firmware version, etc.) */
  INFO_CHARACTERISTIC_UUID: '0000FFE3-0000-1000-8000-00805F9B34FB',
  /** Device name prefix used for filtering scan results */
  DEVICE_NAME_PREFIX: 'ShitBit',
  /** Scan timeout in milliseconds */
  SCAN_TIMEOUT_MS: 10000,
} as const;

/** Callback type for when a new session is received from the device. */
export type OnSessionReceived = (session: WeighSession) => void;

/** Callback type for device status changes. */
export type OnStatusChanged = (status: DeviceStatus) => void;

/** Interface that both real and mock BLE services must implement. */
export interface IBleService {
  /** Start scanning for ShitBit devices. */
  startScan(onDeviceFound: (device: ShitBitDevice) => void): Promise<void>;
  /** Stop scanning. */
  stopScan(): void;
  /** Connect to a specific device by ID. */
  connect(deviceId: string): Promise<void>;
  /** Disconnect from the current device. */
  disconnect(): Promise<void>;
  /** Subscribe to incoming weigh sessions. Returns an unsubscribe function. */
  onSession(callback: OnSessionReceived): () => void;
  /** Subscribe to status changes. Returns an unsubscribe function. */
  onStatusChange(callback: OnStatusChanged): () => void;
  /** Get current connection status. */
  getStatus(): DeviceStatus;
  /** Get the currently connected device, or null. */
  getConnectedDevice(): ShitBitDevice | null;
}
