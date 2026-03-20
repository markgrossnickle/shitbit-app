/**
 * Device screen (presented as modal).
 *
 * BLE connection management: scan for devices, connect, disconnect.
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { useDeviceStore } from '@/src/store';
import { getBleService, getMockBleService, DeviceStatus, type ShitBitDevice } from '@/src/services/ble';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/src/theme';

export default function DeviceScreen() {
  const {
    connectedDevice,
    status,
    scanResults,
    scanning,
    error,
    setStatus,
    setConnectedDevice,
    addScanResult,
    clearScanResults,
    setScanning,
    setError,
    setPairedDeviceId,
  } = useDeviceStore();

  const [connecting, setConnecting] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    clearScanResults();
    setScanning(true);
    setError(null);

    try {
      const ble = getBleService();
      await ble.startScan((device: ShitBitDevice) => {
        addScanResult(device);
      });

      // Auto-stop after timeout
      setTimeout(() => {
        setScanning(false);
      }, 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
      setScanning(false);
    }
  }, [clearScanResults, setScanning, setError, addScanResult]);

  const handleConnect = useCallback(
    async (device: ShitBitDevice) => {
      setConnecting(device.id);
      setError(null);

      try {
        const ble = getBleService();
        await ble.connect(device.id);
        setConnectedDevice(device);
        setPairedDeviceId(device.id);
        setStatus(DeviceStatus.Connected);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed');
        setStatus(DeviceStatus.Disconnected);
      } finally {
        setConnecting(null);
      }
    },
    [setConnectedDevice, setPairedDeviceId, setStatus, setError],
  );

  const handleDisconnect = useCallback(async () => {
    try {
      const ble = getBleService();
      await ble.disconnect();
      setConnectedDevice(null);
      setStatus(DeviceStatus.Disconnected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnect failed');
    }
  }, [setConnectedDevice, setStatus, setError]);

  const handleTestSession = useCallback(() => {
    const mock = getMockBleService();
    if (mock) {
      mock.triggerSession();
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Connected device */}
      {connectedDevice && status === DeviceStatus.Connected ? (
        <View style={styles.connectedCard}>
          <View style={styles.connectedHeader}>
            <View style={[styles.statusDot, { backgroundColor: colors.bleConnected }]} />
            <Text style={styles.connectedTitle}>Connected</Text>
          </View>
          <Text style={styles.deviceName}>{connectedDevice.name}</Text>
          <Text style={styles.deviceId}>{connectedDevice.id}</Text>

          <View style={styles.connectedActions}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestSession}
            >
              <Text style={styles.testButtonText}>Test Session</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {/* Scan button */}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScan}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <ActivityIndicator
                  size="small"
                  color={colors.textInverse}
                  style={{ marginRight: spacing.sm }}
                />
                <Text style={styles.scanButtonText}>Scanning...</Text>
              </>
            ) : (
              <Text style={styles.scanButtonText}>Scan for Devices</Text>
            )}
          </TouchableOpacity>

          {/* Error message */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Scan results */}
          <FlatList
            data={scanResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceRow}
                onPress={() => handleConnect(item)}
                disabled={connecting === item.id}
              >
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceRowName}>{item.name}</Text>
                  <Text style={styles.deviceRowId}>{item.id}</Text>
                </View>
                <View style={styles.deviceSignal}>
                  {connecting === item.id ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <>
                      <Text style={styles.rssiText}>{item.rssi} dBm</Text>
                      <Text style={styles.signalBars}>
                        {getSignalBars(item.rssi)}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !scanning ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>📡</Text>
                  <Text style={styles.emptyText}>
                    Tap scan to find nearby ShitBit devices
                  </Text>
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
}

function getSignalBars(rssi: number): string {
  if (rssi >= -50) return '▂▄▆█';
  if (rssi >= -65) return '▂▄▆░';
  if (rssi >= -80) return '▂▄░░';
  return '▂░░░';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  connectedCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.bleConnected,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  connectedTitle: {
    color: colors.bleConnected,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deviceName: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  deviceId: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    fontFamily: 'SpaceMono',
  },
  connectedActions: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  testButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  testButtonText: {
    color: colors.textInverse,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  disconnectButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.md,
    alignItems: 'center',
  },
  disconnectText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  scanButtonText: {
    color: colors.textInverse,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  errorBanner: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceRowName: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  deviceRowId: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontFamily: 'SpaceMono',
    marginTop: 2,
  },
  deviceSignal: {
    alignItems: 'flex-end',
  },
  rssiText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  signalBars: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: 'SpaceMono',
    marginTop: 2,
  },
  emptyContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
