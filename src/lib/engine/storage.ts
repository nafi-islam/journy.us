// localStorage persistence
// v2 keeps v1's keys and shapes and only ever *adds* optional fields, so:
//   - returning players keep their stats with no migration step
//   - rolling back to v1 still works (v1 ignores fields it doesn't know)
// see CLAUDE.md "localStorage contract"

import type { DailyResult, StatsHistory } from './stats';

const STORAGE_KEY = 'journyStats'; // finished dailies, one entry per date
const DAILY_PROGRESS_KEY = 'journyDailyStats'; // today's daily in progress
const VERSION_KEY = 'journyStorageVersion'; // added in v2, for future migrations

export const STORAGE_VERSION = 2;

// today's daily in progress (v1 shape + optional v2 fields)
export interface DailyProgress {
	guessedStates: string[];
	guessCount: number;
	won: boolean;
	resultSeen?: boolean; // v2: the result modal was already shown (no replay on reload)
}

// Function to read a json value from localStorage without ever throwing
function readJson<T>(key: string, fallback: T): T {
	if (typeof localStorage === 'undefined') return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch (err) {
		console.error(`Failed to load ${key}:`, err);
		return fallback;
	}
}

// Function to write a json value to localStorage without ever throwing
function writeJson(key: string, value: unknown) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (err) {
		console.error(`Failed to save ${key}:`, err);
	}
}

// Function to mark the storage version (never rewrites the v1 data itself)
export function ensureStorageVersion() {
	if (readJson<number | null>(VERSION_KEY, null) !== STORAGE_VERSION) {
		writeJson(VERSION_KEY, STORAGE_VERSION);
	}
}

// Function to load the finished dailies
export function loadStats(): StatsHistory {
	return readJson<StatsHistory>(STORAGE_KEY, {});
}

// Function to save the finished dailies
export function saveStats(stats: StatsHistory) {
	writeJson(STORAGE_KEY, stats);
}

// Function to record one finished daily
export function recordDailyResult(dateKey: string, result: DailyResult) {
	const stats = loadStats();
	stats[dateKey] = result;
	saveStats(stats);
}

// Function to load today's daily progress, cleaning up older days (as v1 did)
export function loadDailyProgress(todayKey: string): DailyProgress | null {
	const progress = readJson<Record<string, DailyProgress>>(DAILY_PROGRESS_KEY, {});

	// Clean up old progress
	let changed = false;
	for (const date in progress) {
		if (date !== todayKey) {
			delete progress[date];
			changed = true;
		}
	}
	if (changed) writeJson(DAILY_PROGRESS_KEY, progress);

	return progress[todayKey] ?? null;
}

// Function to save today's daily progress (keeps v2 fields already saved for today)
export function saveDailyProgress(todayKey: string, update: DailyProgress) {
	const progress = readJson<Record<string, DailyProgress>>(DAILY_PROGRESS_KEY, {});
	progress[todayKey] = { ...progress[todayKey], ...update };
	writeJson(DAILY_PROGRESS_KEY, progress);
}

// Function to remember that today's result modal was shown
export function markDailyResultSeen(todayKey: string) {
	const progress = readJson<Record<string, DailyProgress>>(DAILY_PROGRESS_KEY, {});
	if (!progress[todayKey]) return;
	progress[todayKey].resultSeen = true;
	writeJson(DAILY_PROGRESS_KEY, progress);
}
