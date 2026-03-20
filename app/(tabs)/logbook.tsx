/**
 * LogBook screen.
 *
 * Scrollable session history with date grouping.
 */
import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { format, parseISO } from 'date-fns';
import * as Clipboard from 'expo-clipboard';

import { useSessionStore } from '@/src/store';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/src/theme';
import { encodeSession, getSessionTier } from '@/src/utils/shareEncoder';
import type { Session } from '@/src/types';

interface DateSection {
  title: string;
  data: Session[];
}

export default function LogBookScreen() {
  const { sessions, refreshing, fetchSessions, refreshSessions } = useSessionStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Group sessions by date
  const sections: DateSection[] = useMemo(() => {
    const groups = new Map<string, Session[]>();
    for (const session of sessions) {
      const dateKey = format(parseISO(session.timestamp), 'yyyy-MM-dd');
      const existing = groups.get(dateKey) ?? [];
      existing.push(session);
      groups.set(dateKey, existing);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, data]) => ({
        title: format(parseISO(dateKey), 'EEEE, MMMM d'),
        data,
      }));
  }, [sessions]);

  const handleShare = async (session: Session) => {
    const shareText = encodeSession(session.delta, new Date(session.timestamp));
    await Clipboard.setStringAsync(shareText);
    // TODO: Show a toast or haptic feedback
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const tier = getSessionTier(item.delta);
          return (
            <View style={styles.sessionRow}>
              <View style={[styles.tierIndicator, { backgroundColor: tier.color }]} />
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionDelta}>{item.delta}g</Text>
                <Text style={styles.sessionTime}>
                  {format(parseISO(item.timestamp), 'h:mm a')}
                </Text>
              </View>
              <View style={styles.sessionMeta}>
                <Text style={[styles.sessionTier, { color: tier.color }]}>
                  {tier.label}
                </Text>
                <Text style={styles.sessionGrid}>
                  {'█'.repeat(tier.cells)}{'░'.repeat(9 - tier.cells)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => handleShare(item)}
              >
                <Text style={styles.shareIcon}>📋</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sessions recorded yet</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshSessions}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  tierIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDelta: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  sessionTime: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  sessionMeta: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  sessionTier: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  sessionGrid: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'SpaceMono',
  },
  shareButton: {
    padding: spacing.sm,
  },
  shareIcon: {
    fontSize: 18,
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
