/**
 * BLE Service entry point.
 *
 * In development, we use the mock service so the app can run without
 * actual ShitBit hardware. Set USE_REAL_BLE to true (or use an env var)
 * to switch to the real react-native-ble-plx implementation.
 */
export { type IBleService, type ShitBitDevice, type WeighSession, DeviceStatus, BLE_CONSTANTS } from './types';
export { MockBleService } from './mockBleService';
export { BleService } from './bleService';

import { IBleService } from './types';
import { MockBleService } from './mockBleService';
import { BleService } from './bleService';

/**
 * Set to true to use the real BLE service.
 * In dev builds without hardware, keep this false.
 */
const USE_REAL_BLE = false;

let _instance: IBleService | null = null;

/** Get the singleton BLE service instance. */
export function getBleService(): IBleService {
  if (!_instance) {
    _instance = USE_REAL_BLE ? new BleService() : new MockBleService();
  }
  return _instance;
}

/**
 * Get the mock BLE service (typed). Only works when USE_REAL_BLE is false.
 * Useful for triggering test sessions from dev tools.
 */
export function getMockBleService(): MockBleService | null {
  const service = getBleService();
  if (service instanceof MockBleService) {
    return service;
  }
  return null;
}
