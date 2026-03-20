/**
 * Mock BLE service for development without hardware.
 *
 * Simulates device scanning, connection, and periodic session generation
 * with realistic-looking fake data.
 */
import {
  IBleService,
  ShitBitDevice,
  WeighSession,
  DeviceStatus,
  OnSessionReceived,
  OnStatusChanged,
} from './types';

/** Fake devices that appear during scanning. */
const MOCK_DEVICES: ShitBitDevice[] = [
  { id: 'mock-sb-001', name: 'ShitBit-A3F2', rssi: -45 },
  { id: 'mock-sb-002', name: 'ShitBit-B7D1', rssi: -72 },
  { id: 'mock-sb-003', name: 'ShitBit-C0FE', rssi: -88 },
];

/** Generate a realistic random weight in grams with a normal-ish distribution. */
function randomDelta(): number {
  // Most sessions 100-400g, occasional big ones
  const base = 150 + Math.random() * 200;
  const spike = Math.random() > 0.85 ? Math.random() * 500 : 0;
  return Math.round(base + spike);
}

/** Generate a realistic body weight around 70-90 kg (70000-90000 grams). */
function randomBodyWeight(): number {
  return Math.round(75000 + (Math.random() - 0.5) * 20000);
}

export class MockBleService implements IBleService {
  private status: DeviceStatus = DeviceStatus.Disconnected;
  private connectedDevice: ShitBitDevice | null = null;
  private sessionCallbacks: Set<OnSessionReceived> = new Set();
  private statusCallbacks: Set<OnStatusChanged> = new Set();
  private scanTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionTimer: ReturnType<typeof setInterval> | null = null;

  async startScan(onDeviceFound: (device: ShitBitDevice) => void): Promise<void> {
    console.log('[MockBLE] Starting scan...');

    // Simulate devices appearing one at a time with random delays
    let delay = 300;
    for (const device of MOCK_DEVICES) {
      this.scanTimer = setTimeout(() => {
        // Randomize RSSI slightly each time
        onDeviceFound({
          ...device,
          rssi: device.rssi + Math.round((Math.random() - 0.5) * 10),
        });
      }, delay);
      delay += 500 + Math.random() * 1000;
    }
  }

  stopScan(): void {
    console.log('[MockBLE] Stopping scan');
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
  }

  async connect(deviceId: string): Promise<void> {
    const device = MOCK_DEVICES.find((d) => d.id === deviceId);
    if (!device) {
      throw new Error(`[MockBLE] Unknown device: ${deviceId}`);
    }

    this.setStatus(DeviceStatus.Connecting);
    console.log(`[MockBLE] Connecting to ${device.name}...`);

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    this.connectedDevice = device;
    this.setStatus(DeviceStatus.Connected);
    console.log(`[MockBLE] Connected to ${device.name}`);
  }

  async disconnect(): Promise<void> {
    console.log('[MockBLE] Disconnecting');
    this.stopAutoSessions();
    this.connectedDevice = null;
    this.setStatus(DeviceStatus.Disconnected);
  }

  onSession(callback: OnSessionReceived): () => void {
    this.sessionCallbacks.add(callback);
    return () => {
      this.sessionCallbacks.delete(callback);
    };
  }

  onStatusChange(callback: OnStatusChanged): () => void {
    this.statusCallbacks.add(callback);
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  getStatus(): DeviceStatus {
    return this.status;
  }

  getConnectedDevice(): ShitBitDevice | null {
    return this.connectedDevice;
  }

  // --- Mock-only methods ---

  /**
   * Manually trigger a fake session. Useful for testing UI without waiting.
   * Optionally specify a delta in grams; otherwise a random one is generated.
   */
  triggerSession(deltaOverride?: number): void {
    if (this.status !== DeviceStatus.Connected && this.status !== DeviceStatus.Measuring) {
      console.warn('[MockBLE] Cannot trigger session: not connected');
      return;
    }

    this.setStatus(DeviceStatus.Measuring);

    const delta = deltaOverride ?? randomDelta();
    const sitWeight = randomBodyWeight();
    const standWeight = sitWeight - delta;

    const session: WeighSession = {
      sitWeight,
      standWeight,
      delta,
      timestamp: Date.now(),
      batteryLevel: Math.round(60 + Math.random() * 40),
    };

    // Simulate a brief measurement delay
    setTimeout(() => {
      this.sessionCallbacks.forEach((cb) => cb(session));
      this.setStatus(DeviceStatus.Connected);
    }, 800);
  }

  /**
   * Start generating fake sessions at a regular interval.
   * Useful for demo mode.
   */
  startAutoSessions(intervalMs: number = 15000): void {
    this.stopAutoSessions();
    this.sessionTimer = setInterval(() => {
      this.triggerSession();
    }, intervalMs);
  }

  /** Stop auto-generating sessions. */
  stopAutoSessions(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Generate a batch of historical sessions for seeding the session store.
   * Creates sessions spread over the past N days.
   */
  static generateHistory(days: number = 30, sessionsPerDay: number = 1): WeighSession[] {
    const sessions: WeighSession[] = [];
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;

    for (let d = days; d >= 0; d--) {
      // Some days might be skipped (80% chance of having a session)
      if (Math.random() > 0.8 && d > 0) continue;

      const count = Math.random() > 0.85 ? 2 : sessionsPerDay;
      for (let s = 0; s < count; s++) {
        const delta = randomDelta();
        const sitWeight = randomBodyWeight();
        const dayOffset = d * msPerDay;
        // Randomize time within the day (morning-biased: 6am-10am mostly)
        const hourOffset =
          (6 + Math.random() * 4 + (s > 0 ? 8 + Math.random() * 4 : 0)) * 3600 * 1000;

        sessions.push({
          sitWeight,
          standWeight: sitWeight - delta,
          delta,
          timestamp: now - dayOffset + hourOffset,
          batteryLevel: Math.round(40 + Math.random() * 60),
        });
      }
    }

    return sessions;
  }

  private setStatus(status: DeviceStatus): void {
    this.status = status;
    this.statusCallbacks.forEach((cb) => cb(status));
  }
}
