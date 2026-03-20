/**
 * Real BLE service using react-native-ble-plx.
 *
 * This connects to actual ShitBit hardware. It is not usable in
 * Expo Go -- requires a dev client or standalone build.
 */
import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import {
  IBleService,
  ShitBitDevice,
  WeighSession,
  DeviceStatus,
  OnSessionReceived,
  OnStatusChanged,
  BLE_CONSTANTS,
} from './types';

export class BleService implements IBleService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private status: DeviceStatus = DeviceStatus.Disconnected;
  private sessionCallbacks: Set<OnSessionReceived> = new Set();
  private statusCallbacks: Set<OnStatusChanged> = new Set();
  private monitorSubscription: Subscription | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  async startScan(onDeviceFound: (device: ShitBitDevice) => void): Promise<void> {
    // Request permissions are handled at the app level before calling this
    this.manager.startDeviceScan(
      [BLE_CONSTANTS.SERVICE_UUID],
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('[BLE] Scan error:', error.message);
          return;
        }
        if (
          device &&
          device.name &&
          device.name.startsWith(BLE_CONSTANTS.DEVICE_NAME_PREFIX)
        ) {
          onDeviceFound({
            id: device.id,
            name: device.name,
            rssi: device.rssi ?? -100,
          });
        }
      },
    );

    // Auto-stop after timeout
    setTimeout(() => {
      this.stopScan();
    }, BLE_CONSTANTS.SCAN_TIMEOUT_MS);
  }

  stopScan(): void {
    this.manager.stopDeviceScan();
  }

  async connect(deviceId: string): Promise<void> {
    this.setStatus(DeviceStatus.Connecting);
    try {
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;
      this.setStatus(DeviceStatus.Connected);

      // Monitor the weigh characteristic for incoming sessions
      this.monitorSubscription = device.monitorCharacteristicForService(
        BLE_CONSTANTS.SERVICE_UUID,
        BLE_CONSTANTS.WEIGH_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('[BLE] Monitor error:', error.message);
            return;
          }
          if (characteristic?.value) {
            const session = this.parseWeighData(characteristic.value);
            if (session) {
              this.notifySession(session);
            }
          }
        },
      );

      // Monitor disconnection
      this.manager.onDeviceDisconnected(deviceId, () => {
        this.connectedDevice = null;
        this.setStatus(DeviceStatus.Disconnected);
      });
    } catch (error) {
      console.error('[BLE] Connection error:', error);
      this.setStatus(DeviceStatus.Disconnected);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.monitorSubscription) {
      this.monitorSubscription.remove();
      this.monitorSubscription = null;
    }
    if (this.connectedDevice) {
      try {
        await this.manager.cancelDeviceConnection(this.connectedDevice.id);
      } catch {
        // Device may already be disconnected
      }
      this.connectedDevice = null;
    }
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
    if (!this.connectedDevice) return null;
    return {
      id: this.connectedDevice.id,
      name: this.connectedDevice.name ?? 'ShitBit',
      rssi: this.connectedDevice.rssi ?? -100,
    };
  }

  // --- Private helpers ---

  private setStatus(status: DeviceStatus): void {
    this.status = status;
    this.statusCallbacks.forEach((cb) => cb(status));
  }

  private notifySession(session: WeighSession): void {
    this.sessionCallbacks.forEach((cb) => cb(session));
  }

  /**
   * Parse raw BLE characteristic value into a WeighSession.
   *
   * The firmware sends a binary payload (base64 encoded by react-native-ble-plx):
   *   Bytes 0-3: sitWeight (uint32 LE, grams)
   *   Bytes 4-7: standWeight (uint32 LE, grams)
   *   Byte 8: batteryLevel (uint8, 0-100)
   *
   * Delta and timestamp are computed client-side.
   */
  private parseWeighData(base64Value: string): WeighSession | null {
    try {
      const raw = Buffer.from(base64Value, 'base64');
      if (raw.length < 9) return null;

      const sitWeight = raw.readUInt32LE(0);
      const standWeight = raw.readUInt32LE(4);
      const batteryLevel = raw.readUInt8(8);

      return {
        sitWeight,
        standWeight,
        delta: sitWeight - standWeight,
        timestamp: Date.now(),
        batteryLevel,
      };
    } catch {
      console.error('[BLE] Failed to parse weigh data');
      return null;
    }
  }
}
