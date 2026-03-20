/**
 * Friends API endpoints.
 *
 * Returns mock data until the backend is deployed.
 */
import { apiRequest } from './client';
import type { Friend } from '@/src/types';

const USE_MOCK = true;

const MOCK_FRIENDS: Friend[] = [
  {
    id: 'friend-001',
    userId: 'user-jake',
    username: 'jake_the_snake',
    displayName: 'Jake',
    avatarUrl: null,
    since: '2026-02-01T00:00:00Z',
  },
  {
    id: 'friend-002',
    userId: 'user-sarah',
    username: 'sarahpoops',
    displayName: 'Sarah B.',
    avatarUrl: null,
    since: '2026-02-10T00:00:00Z',
  },
  {
    id: 'friend-003',
    userId: 'user-mike',
    username: 'bigmike420',
    displayName: 'Big Mike',
    avatarUrl: null,
    since: '2026-03-01T00:00:00Z',
  },
];

/** Get the current user's friend list. */
export async function getFriends(): Promise<Friend[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_FRIENDS;
  }

  return apiRequest<Friend[]>({
    method: 'GET',
    path: '/friends',
  });
}

/** Add a friend by username. */
export async function addFriend(username: string): Promise<Friend> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    const friend: Friend = {
      id: `friend-${Date.now()}`,
      userId: `user-${username}`,
      username,
      displayName: username,
      avatarUrl: null,
      since: new Date().toISOString(),
    };
    MOCK_FRIENDS.push(friend);
    return friend;
  }

  return apiRequest<Friend>({
    method: 'POST',
    path: '/friends/add',
    body: { username },
  });
}

/** Remove a friend. */
export async function removeFriend(friendId: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const idx = MOCK_FRIENDS.findIndex((f) => f.id === friendId);
    if (idx !== -1) MOCK_FRIENDS.splice(idx, 1);
    return;
  }

  return apiRequest<void>({
    method: 'DELETE',
    path: `/friends/${friendId}`,
  });
}
