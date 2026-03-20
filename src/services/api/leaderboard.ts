/**
 * Leaderboard API endpoints.
 *
 * Returns mock data until the backend is deployed.
 */
import { apiRequest } from './client';
import type { Leaderboard, LeaderboardType, LeaderboardEntry } from '@/src/types';

const USE_MOCK = true;

function makeMockEntries(type: LeaderboardType): LeaderboardEntry[] {
  const names = [
    { username: 'bowel_king', displayName: 'BowelKing' },
    { username: 'poopmaster', displayName: 'The Poopmaster' },
    { username: 'bigmike420', displayName: 'Big Mike' },
    { username: 'sarahpoops', displayName: 'Sarah B.' },
    { username: 'jake_the_snake', displayName: 'Jake' },
    { username: 'gutbuster99', displayName: 'GutBuster' },
    { username: 'throne_warrior', displayName: 'ThroneWarrior' },
    { username: 'daily_dookie', displayName: 'DailyDookie' },
  ];

  // Generate values appropriate to the leaderboard type
  const valueRanges: Record<LeaderboardType, { base: number; spread: number }> = {
    daily: { base: 200, spread: 400 },
    weekly: { base: 1500, spread: 2000 },
    alltime: { base: 50000, spread: 80000 },
    biggest: { base: 400, spread: 800 },
  };

  const range = valueRanges[type];
  const entries = names.map((n, i) => ({
    rank: i + 1,
    userId: `user-${n.username}`,
    username: n.username,
    displayName: n.displayName,
    avatarUrl: null,
    value: Math.round(range.base + (names.length - i) * (range.spread / names.length) + Math.random() * 50),
    isCurrentUser: n.username === 'poopmaster',
  }));

  // Sort by value descending and re-assign ranks
  entries.sort((a, b) => b.value - a.value);
  entries.forEach((e, i) => (e.rank = i + 1));

  return entries;
}

/** Fetch a leaderboard by type. */
export async function getLeaderboard(type: LeaderboardType): Promise<Leaderboard> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    const entries = makeMockEntries(type);
    const currentUser = entries.find((e) => e.isCurrentUser);
    return {
      type,
      entries,
      currentUserRank: currentUser?.rank ?? entries.length + 1,
      currentUserValue: currentUser?.value ?? 0,
    };
  }

  return apiRequest<Leaderboard>({
    method: 'GET',
    path: `/leaderboard/${type}`,
  });
}
