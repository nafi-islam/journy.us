// daily statistics (ported from v1 DailyChallengeModal.svelte)

import { daysBetween } from './dates';

// one finished daily, stored in localStorage under journyStats (v1 shape, do not change)
export interface DailyResult {
	won: boolean;
	guessCount: number;
	shortestPathLength: number;
	isDaily: boolean;
}

export type StatsHistory = Record<string, DailyResult>;

export interface AggregateStats {
	gamesPlayed: number;
	winRate: number;
	currentStreak: number;
	maxStreak: number;
	guessDistribution: number[];
}

// guesses can go up to 5 optimal + 3 extra = 8
const DISTRIBUTION_SIZE = 8;

// Function to compute all-time stats from the daily history
// a streak counts daily wins on consecutive calendar days. it resets on a loss or a skipped
// day, and the current streak is only alive if the last win was today or yesterday
export function computeStats(history: StatsHistory, todayKey: string): AggregateStats {
	const stats: AggregateStats = {
		gamesPlayed: 0,
		winRate: 0,
		currentStreak: 0,
		maxStreak: 0,
		guessDistribution: Array(DISTRIBUTION_SIZE).fill(0)
	};

	const dates = Object.keys(history).sort();
	let streak = 0;
	let winCount = 0;
	let lastWinDate: string | null = null;

	for (const date of dates) {
		const entry = history[date];
		if (!entry) continue;

		stats.gamesPlayed++;

		if (entry.won && entry.isDaily) {
			winCount++;

			// keep the streak only if the previous win was the day before
			const isNextDay = lastWinDate !== null && daysBetween(lastWinDate, date) === 1;
			streak = isNextDay ? streak + 1 : 1;
			lastWinDate = date;

			const index = entry.guessCount - 1;
			if (index >= 0 && index < stats.guessDistribution.length) {
				stats.guessDistribution[index]++;
			}
		} else {
			streak = 0;
			lastWinDate = null;
		}

		if (streak > stats.maxStreak) stats.maxStreak = streak;
	}

	// avoid NaN for brand new players
	stats.winRate = stats.gamesPlayed > 0 ? Math.round((winCount / stats.gamesPlayed) * 100) : 0;

	// the current streak is broken if the last win is older than yesterday
	const streakIsAlive = lastWinDate !== null && daysBetween(lastWinDate, todayKey) <= 1;
	stats.currentStreak = streakIsAlive ? streak : 0;

	return stats;
}
