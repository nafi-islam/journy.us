// the daily puzzle
// before SWITCH_DATE the daily comes from the v1 json (legacy.ts) and rolls over at utc midnight.
// from SWITCH_DATE it is generated from the date and rolls over at the player's local midnight.
// see CLAUDE.md "daily puzzle" for how the generator works

import { statesGraph, type StatesGraph } from './statesGraph';
import { countStatesBetween, findShortestPath } from './search';
import { legacyStatesGraph, type LegacyChallenges } from './legacy';
import {
	CHALLENGE_START_DATE,
	daysBetween,
	getChallengeNumber,
	localDateKey,
	utcDateKey
} from './dates';

// the first day that is generated instead of read from the v1 json.
// set this to the cutover day at release. default: the day after the json runs out
// (2030-04-05), so the game keeps working even if it is never changed.
// changing it never changes which puzzle a date gets, only where the puzzle comes from
export const SWITCH_DATE = '2030-04-06';

// daily puzzles have 3 to 5 states in between (same as v1)
export const MIN_STATES_BETWEEN = 3;
export const MAX_STATES_BETWEEN = 5;

// no pair comes back within this many days, even across two cycles
export const REPEAT_WINDOW = 60;

// changing the salt changes every generated puzzle. never change it after release
const DAILY_SALT = 'journy-daily-v2';

export interface DailyPuzzle {
	dateKey: string;
	challengeNumber: number;
	start: string;
	target: string;
	shortestPath: string[];
	graph: StatesGraph;
	source: 'legacy' | 'generated';
}

// Function to get today's daily date key
// before the switch: utc date (v1). after: the player's local date. on the evening before the
// switch (behind utc) the utc date is already the switch day, so nobody's puzzle changes mid-day
export function getTodayKey(now: Date = new Date(), switchDate: string = SWITCH_DATE): string {
	const local = localDateKey(now);
	return local >= switchDate ? local : utcDateKey(now);
}

// Function to check if a date still uses the v1 json
export function isLegacyDate(dateKey: string, switchDate: string = SWITCH_DATE): boolean {
	return dateKey < switchDate;
}

// Function to get the graph a date's daily is played on
export function getDailyGraph(dateKey: string, switchDate: string = SWITCH_DATE): StatesGraph {
	return isLegacyDate(dateKey, switchDate) ? legacyStatesGraph : statesGraph;
}

// Function to turn text into a 32-bit number (fnv-1a hash), used to seed the generator
export function hashString(text: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

// Function to create a seeded random number generator (mulberry32). same seed = same numbers
export function createRandom(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// Function to shuffle a copy of a list with a seeded random generator (fisher-yates)
function seededShuffle<T>(items: T[], random: () => number): T[] {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

let poolCache: [string, string][] | null = null;

// Function to list every pair of states (alphabetical, each pair once) that makes a valid daily
export function getDailyPool(): [string, string][] {
	if (poolCache) return poolCache;

	const states = Object.keys(statesGraph).sort();
	const pool: [string, string][] = [];

	for (let i = 0; i < states.length; i++) {
		for (let j = i + 1; j < states.length; j++) {
			const between = countStatesBetween(states[i], states[j]);
			if (between !== null && between >= MIN_STATES_BETWEEN && between <= MAX_STATES_BETWEEN) {
				pool.push([states[i], states[j]]);
			}
		}
	}

	poolCache = pool;
	return pool;
}

// Function to get the raw shuffled order of the pool for one cycle
function shuffledCycle(cycle: number): [string, string][] {
	return seededShuffle(getDailyPool(), createRandom(hashString(`${DAILY_SALT}:cycle:${cycle}`)));
}

// Function to get the final order of the pool for one cycle
// every pair is used once per cycle. the first REPEAT_WINDOW days of a cycle are swapped with
// later days if they appeared in the last REPEAT_WINDOW days of the previous cycle. swaps only
// use the middle of the list, so a cycle's tail never changes (no chain back to cycle 0)
function cycleOrder(cycle: number): [string, string][] {
	const order = shuffledCycle(cycle);
	if (cycle === 0) return order;

	const previous = shuffledCycle(cycle - 1);
	const recent = new Set(previous.slice(-REPEAT_WINDOW).map((pair) => pair.join('|')));
	const isRecent = (index: number) => recent.has(order[index].join('|'));

	let swapIndex = REPEAT_WINDOW;
	for (let i = 0; i < REPEAT_WINDOW; i++) {
		if (!isRecent(i)) continue;
		while (swapIndex < order.length - REPEAT_WINDOW && isRecent(swapIndex)) swapIndex++;
		[order[i], order[swapIndex]] = [order[swapIndex], order[i]];
		swapIndex++;
	}

	return order;
}

// Function to generate the daily puzzle for any date (deterministic: same date, same puzzle)
export function getGeneratedPuzzle(dateKey: string): DailyPuzzle {
	const pool = getDailyPool();
	const dayIndex = daysBetween(CHALLENGE_START_DATE, dateKey);
	const cycle = Math.floor(dayIndex / pool.length);
	const position = dayIndex - cycle * pool.length;
	const [first, second] = cycleOrder(cycle)[position];

	// seeded coin flip for which state is the start
	const flip = createRandom(hashString(`${DAILY_SALT}:day:${dayIndex}`))() < 0.5;
	const start = flip ? second : first;
	const target = flip ? first : second;

	return {
		dateKey,
		challengeNumber: getChallengeNumber(dateKey),
		start,
		target,
		shortestPath: findShortestPath(start, target, statesGraph)!,
		graph: statesGraph,
		source: 'generated'
	};
}

// Function to read a date's daily from the v1 json
export function getLegacyPuzzle(dateKey: string, challenges: LegacyChallenges): DailyPuzzle | null {
	const challenge = challenges[dateKey];
	if (!challenge) return null;

	return {
		dateKey,
		challengeNumber: getChallengeNumber(dateKey),
		start: challenge.dailyStartState,
		target: challenge.dailyTargetState,
		shortestPath: challenge.shortestPath,
		graph: legacyStatesGraph,
		source: 'legacy'
	};
}
