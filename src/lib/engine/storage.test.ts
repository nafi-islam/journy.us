// tests for localStorage persistence. the v1 keys and shapes must keep working

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ensureStorageVersion,
	loadDailyProgress,
	loadStats,
	markDailyResultSeen,
	recordDailyResult,
	saveDailyProgress
} from './storage';

// Function to create a tiny in-memory localStorage (vitest runs in node, which has none)
function createMemoryStorage() {
	const data = new Map<string, string>();
	return {
		getItem: (key: string) => data.get(key) ?? null,
		setItem: (key: string, value: string) => data.set(key, String(value)),
		removeItem: (key: string) => data.delete(key),
		clear: () => data.clear()
	};
}

// real payloads written by v1 (captured with playwright on 2026-10-11)
const V1_STATS = {
	'2026-10-10': { won: false, guessCount: 6, shortestPathLength: 4, isDaily: true },
	'2026-10-11': { won: true, guessCount: 3, shortestPathLength: 3, isDaily: true }
};
const V1_DAILY = {
	'2026-10-10': { guessedStates: ['Maine'], guessCount: 1, won: false },
	'2026-10-11': { guessedStates: ['Wyoming', 'Nebraska', 'Missouri'], guessCount: 3, won: true }
};

beforeEach(() => {
	vi.stubGlobal('localStorage', createMemoryStorage());
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('v1 data', () => {
	it('reads v1 journyStats as-is', () => {
		localStorage.setItem('journyStats', JSON.stringify(V1_STATS));
		expect(loadStats()).toEqual(V1_STATS);
	});

	it('reads v1 journyDailyStats for today and cleans up older days (as v1 did)', () => {
		localStorage.setItem('journyDailyStats', JSON.stringify(V1_DAILY));
		expect(loadDailyProgress('2026-10-11')).toEqual(V1_DAILY['2026-10-11']);
		expect(JSON.parse(localStorage.getItem('journyDailyStats')!)).toEqual({
			'2026-10-11': V1_DAILY['2026-10-11']
		});
	});

	it('marks the storage version without touching v1 data', () => {
		localStorage.setItem('journyStats', JSON.stringify(V1_STATS));
		ensureStorageVersion();
		expect(localStorage.getItem('journyStorageVersion')).toBe('2');
		expect(JSON.parse(localStorage.getItem('journyStats')!)).toEqual(V1_STATS);
	});
});

describe('writing', () => {
	it('records a result in the v1 shape next to existing history', () => {
		localStorage.setItem('journyStats', JSON.stringify({ '2026-10-10': V1_STATS['2026-10-10'] }));
		recordDailyResult('2026-10-11', V1_STATS['2026-10-11']);
		expect(loadStats()).toEqual(V1_STATS);
	});

	it('saves progress in the v1 shape', () => {
		saveDailyProgress('2026-10-11', { guessedStates: ['Wyoming'], guessCount: 1, won: false });
		expect(JSON.parse(localStorage.getItem('journyDailyStats')!)).toEqual({
			'2026-10-11': { guessedStates: ['Wyoming'], guessCount: 1, won: false }
		});
	});

	it('only adds the optional resultSeen field (v1 ignores it)', () => {
		saveDailyProgress('2026-10-11', V1_DAILY['2026-10-11']);
		markDailyResultSeen('2026-10-11');
		expect(loadDailyProgress('2026-10-11')).toEqual({
			...V1_DAILY['2026-10-11'],
			resultSeen: true
		});
	});

	it('keeps resultSeen when progress is saved again', () => {
		saveDailyProgress('2026-10-11', V1_DAILY['2026-10-11']);
		markDailyResultSeen('2026-10-11');
		saveDailyProgress('2026-10-11', V1_DAILY['2026-10-11']);
		expect(loadDailyProgress('2026-10-11')?.resultSeen).toBe(true);
	});

	it('does nothing when marking a day that has no progress', () => {
		markDailyResultSeen('2026-10-11');
		expect(localStorage.getItem('journyDailyStats')).toBeNull();
	});
});

describe('bad data', () => {
	it('never throws on corrupt json', () => {
		localStorage.setItem('journyStats', '{not json');
		localStorage.setItem('journyDailyStats', 'oops');
		expect(loadStats()).toEqual({});
		expect(loadDailyProgress('2026-10-11')).toBeNull();
	});
});
