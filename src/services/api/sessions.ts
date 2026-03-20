/**
 * Session API endpoints.
 *
 * Returns mock data until the backend is deployed.
 */
import { apiRequest } from './client';
import type { Session, SessionStats } from '@/src/types';
import { MockBleService } from '../ble/mockBleService';

const USE_MOCK = true;

/** Generate a set of mock sessions for development. */
function generateMockSessions(): Session[] {
  const history = MockBleService.generateHistory(30);
  return history.map((ws, i) => ({
    id: `mock-session-${String(i).padStart(4, '0')}`,
    userId: 'mock-user-001',
    sitWeight: ws.sitWeight,
    standWeight: ws.standWeight,
    delta: ws.delta,
    timestamp: new Date(ws.timestamp).toISOString(),
    batteryLevel: ws.batteryLevel,
    synced: true,
  }));
}

let _mockSessions: Session[] | null = null;

function getMockSessions(): Session[] {
  if (!_mockSessions) {
    _mockSessions = generateMockSessions();
  }
  return _mockSessions;
}

/** Fetch all sessions for the current user. */
export async function getSessions(): Promise<Session[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return getMockSessions();
  }

  return apiRequest<Session[]>({
    method: 'GET',
    path: '/sessions',
  });
}

/** Log a new session to the server. */
export async function createSession(
  session: Omit<Session, 'id' | 'userId' | 'synced'>,
): Promise<Session> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const newSession: Session = {
      ...session,
      id: `mock-session-${Date.now()}`,
      userId: 'mock-user-001',
      synced: true,
    };
    getMockSessions().unshift(newSession);
    return newSession;
  }

  return apiRequest<Session>({
    method: 'POST',
    path: '/sessions',
    body: session,
  });
}

/** Get aggregated stats for the current user. */
export async function getStats(): Promise<SessionStats> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const sessions = getMockSessions();
    const deltas = sessions.map((s) => s.delta);
    const total = deltas.reduce((sum, d) => sum + d, 0);

    // Compute streak (consecutive days with sessions)
    const sessionDates = new Set(
      sessions.map((s) => new Date(s.timestamp).toISOString().slice(0, 10)),
    );
    let streak = 0;
    const today = new Date();
    for (let d = 0; d < 365; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().slice(0, 10);
      if (sessionDates.has(dateStr)) {
        streak++;
      } else if (d > 0) {
        break;
      }
    }

    return {
      totalSessions: sessions.length,
      lifetimeTotal: total,
      averageDelta: sessions.length > 0 ? Math.round(total / sessions.length) : 0,
      biggestSingle: deltas.length > 0 ? Math.max(...deltas) : 0,
      currentStreak: streak,
      longestStreak: Math.max(streak, 7), // Mock a reasonable longest streak
      lastSessionDate: sessions.length > 0 ? sessions[0].timestamp : null,
    };
  }

  return apiRequest<SessionStats>({
    method: 'GET',
    path: '/stats',
  });
}

/** Delete a session by ID. */
export async function deleteSession(sessionId: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const sessions = getMockSessions();
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) sessions.splice(idx, 1);
    return;
  }

  return apiRequest<void>({
    method: 'DELETE',
    path: `/sessions/${sessionId}`,
  });
}
