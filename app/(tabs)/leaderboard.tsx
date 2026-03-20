/**
 * Leaderboard screen.
 *
 * Shows friend rankings across different time periods.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { useFriendsStore } from '@/src/store';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/src/theme';
import type { LeaderboardType, LeaderboardEntry } from '@/src/types';

const TABS: { key: LeaderboardType; label: string }[] = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: 'Week' },
  { key: 'alltime', label: 'All Time' },
  { key: 'biggest', label: 'Biggest' },
];

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('daily');
  const { leaderboards, loadingLeaderboard, fetchLeaderboard } = useFriendsStore();

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  const leaderboard = leaderboards[activeTab];

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard list */}
      {loadingLeaderboard && !leaderboard ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={leaderboard?.entries ?? []}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => <LeaderboardRow entry={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No entries yet</Text>
            </View>
          }
        />
      )}

      {/* Current user rank footer */}
      {leaderboard && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your rank: #{leaderboard.currentUserRank} ({formatValue(leaderboard.currentUserValue, activeTab)})
          </Text>
        </View>
      )}
    </View>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const rankEmoji = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';

  return (
    <View
      style={[
        styles.row,
        entry.isCurrentUser && styles.currentUserRow,
      ]}
    >
      <Text style={styles.rank}>
        {rankEmoji || `#${entry.rank}`}
      </Text>
      <View style={styles.userInfo}>
        <Text
          style={[
            styles.displayName,
            entry.isCurrentUser && styles.currentUserName,
          ]}
        >
          {entry.displayName}
        </Text>
        <Text style={styles.username}>@{entry.username}</Text>
      </View>
      <Text style={styles.value}>
        {entry.value >= 1000
          ? `${(entry.value / 1000).toFixed(1)}kg`
          : `${entry.value}g`}
      </Text>
    </View>
  );
}

function formatValue(value: number, type: LeaderboardType): string {
  if (type === 'alltime') {
    return `${(value / 1000).toFixed(1)}kg`;
  }
  return `${value}g`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  activeTabText: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  currentUserRow: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  rank: {
    width: 40,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  displayName: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  currentUserName: {
    color: colors.accent,
  },
  username: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  value: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  emptyContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});
