/**
 * Dashboard / Home screen.
 *
 * Shows the latest session result, quick stats, and device connection status.
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

import { useSessionStore, useDeviceStore } from '@/src/store';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/src/theme';
import { getSessionTier } from '@/src/utils/shareEncoder';
import { DeviceStatus } from '@/src/services/ble';

export default function DashboardScreen() {
  const router = useRouter();
  const { sessions, stats, loading, fetchSessions, fetchStats } = useSessionStore();
  const { status } = useDeviceStore();

  const latestSession = sessions.length > 0 ? sessions[0] : null;

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, [fetchSessions, fetchStats]);

  const tier = latestSession ? getSessionTier(latestSession.delta) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Device connection banner */}
      <TouchableOpacity
        style={[styles.deviceBanner, { borderColor: getStatusColor(status) }]}
        onPress={() => router.push('/device')}
      >
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
        <Text style={styles.deviceText}>
          {status === DeviceStatus.Connected
            ? 'ShitBit Connected'
            : status === DeviceStatus.Connecting
              ? 'Connecting...'
              : 'Tap to connect device'}
        </Text>
      </TouchableOpacity>

      {/* Latest session card */}
      {loading && !latestSession ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : latestSession ? (
        <View style={styles.sessionCard}>
          <Text style={styles.cardLabel}>LATEST SESSION</Text>
          <Text style={[styles.deltaValue, { color: tier?.color ?? colors.textPrimary }]}>
            {latestSession.delta}g
          </Text>
          <Text style={[styles.tierLabel, { color: tier?.color ?? colors.textSecondary }]}>
            {tier?.label}
          </Text>
          <Text style={styles.sessionDate}>
            {format(new Date(latestSession.timestamp), 'MMM d, yyyy h:mm a')}
          </Text>

          {/* Mini grid indicator */}
          <View style={styles.gridContainer}>
            {Array.from({ length: 9 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.gridCell,
                  {
                    backgroundColor:
                      tier && i < tier.cells ? tier.color : colors.surface,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>💩</Text>
          <Text style={styles.emptyText}>No sessions yet</Text>
          <Text style={styles.emptySubtext}>
            Connect your ShitBit to start tracking
          </Text>
        </View>
      )}

      {/* Quick stats */}
      {stats && (
        <View style={styles.statsGrid}>
          <StatBox label="Total Sessions" value={String(stats.totalSessions)} />
          <StatBox
            label="Lifetime"
            value={`${(stats.lifetimeTotal / 1000).toFixed(1)}kg`}
          />
          <StatBox label="Average" value={`${stats.averageDelta}g`} />
          <StatBox label="Streak" value={`${stats.currentStreak}d`} />
        </View>
      )}
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getStatusColor(status: DeviceStatus): string {
  switch (status) {
    case DeviceStatus.Connected:
    case DeviceStatus.Measuring:
      return colors.bleConnected;
    case DeviceStatus.Connecting:
      return colors.bleConnecting;
    default:
      return colors.bleDisconnected;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  deviceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  deviceText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  loadingContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  deltaValue: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.heavy,
  },
  tierLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  sessionDate: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 72,
    marginTop: spacing.lg,
  },
  gridCell: {
    width: 20,
    height: 20,
    margin: 2,
    borderRadius: 3,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
