/**
 * This script generates a list of valid challenges for the daily challenge
 * The output is a JSON of objects with valid challenges for the next five years (1,825 days)
 * Rulesets are based on getRandomStatePair(), findShortestPath(), and checkPreviousChallenges().
 * Output is saved to src/static/validChallenges.json and used in Prompt.svelte.
 */

import * as fs from 'fs';
import * as path from 'path';
import { getRandomStatePair, findShortestPath } from './utils';

// prettier-ignore
// Store generated challenges
const challenges: Record<string, { dailyStartState: string; dailyTargetState: string; dailyPathLength: number; shortestPath: string[];}> = {};

// Keep track of previous challenges for validation
const previousChallenges: string[] = [];

// Ensure unique challenges within the last 7 days
function checkPreviousChallenges(start: string, target: string): boolean {
	return !previousChallenges.includes(`${start}-${target}`);
}

// Generate 1825 daily challenges (5 years)
for (let i = 0; i < 1825; i++) {
	let start = '',
		target = '',
		length = 0,
		shortestPath: string[] = [];
	let validChallenge = false;

	while (!validChallenge) {
		// Generate a valid start & target state
		const { start: s, target: t } = getRandomStatePair();
		const path = findShortestPath(s, t);

		// Ensure it's not a repeat within the last 7 days & path is valid
		if (
			path &&
			path.length >= 5 && // Minimum path length (start + 2 guesses + target)
			path.length <= 8 && // Max length (start + 6 guesses + target)
			checkPreviousChallenges(s, t)
		) {
			start = s;
			target = t;
			shortestPath = path;
			length = path.length - 2; // Only count in-between guesses
			validChallenge = true;

			// Update previous challenges list (limit to last 7 days)
			previousChallenges.push(`${start}-${target}`);
			if (previousChallenges.length > 7) {
				previousChallenges.shift(); // Remove oldest challenge
			}
		}
	}

	// Generate date string (YYYY-MM-DD)
	const date = new Date();
	date.setDate(date.getDate() + i); // Future date offset
	const dateKey = date.toISOString().split('T')[0];

	// Store challenge in JSON object
	challenges[dateKey] = {
		dailyStartState: start,
		dailyTargetState: target,
		dailyPathLength: length,
		shortestPath
	};

	// Error check
	if (!start || !target || length === undefined) {
		throw new Error(`Invalid challenge generated for ${dateKey}`);
	}

	// Progress log
	if (i % 100 === 0) {
		console.log(`🔄 Generated ${i} / 1825 challenges...`);
	}
}

// Write output to JSON file
const filePath = path.join(__dirname, '../output/validChallenges.json');
fs.mkdirSync(path.dirname(filePath), { recursive: true });
fs.writeFileSync(filePath, JSON.stringify(challenges, null, 2));

console.log(`✅ Finished! 5 years of daily challenges saved to ${filePath}`);
