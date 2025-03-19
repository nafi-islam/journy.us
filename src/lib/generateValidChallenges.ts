/**
 * This script generates a list of valid challenges for the daily challenge
 * The output is a JSON of objects with valid challenges for the next five years (1,825 days)
 * Rulesets are based on getRandomStatePair(), findShortestPath(), and generateValidChallenges().
 * Output is saved to src/lib/validChallenges.json and used in Prompt.svelte.
 */

import * as fs from 'fs';
import * as path from 'path';

import { getRandomStatePair, findShortestPath } from './utils.js';

// prettier-ignore
// Store generated challenges
const challenges: Record<string, { dailyStartState: string; dailyTargetState: string; dailyPathLength: number; shortestPath: string[]; }> = {};

// Keep track of previous challenges for validation
const previousChallenges: string[] = [];

// Ensure unique challenges within the last 7 days
function checkPreviousChallenges(start: string, target: string): boolean {
	const challengeKey = `${start}-${target}`;
	return !previousChallenges.includes(challengeKey);
}

// Generate 1825 daily challenges (5 years)
for (let i = 0; i < 1825; i++) {
	let start: string = '',
		target: string = '',
		length: number = 0,
		shortestPath: string[] = [];
	let validChallenge = false;

	while (!validChallenge) {
		// Generate a valid start & target state
		const { start: s, target: t, length: l } = getRandomStatePair();
		const path = findShortestPath(s, t);

		// Ensure it's not a repeat within the last 7 days & path is valid
		if (checkPreviousChallenges(s, t) && path) {
			start = s;
			target = t;
			length = l;
			shortestPath = path; // Store the computed shortest path
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

	// prettier-ignore
	// Store challenge in JSON object
	if (start && target && length !== undefined) {
		challenges[dateKey] = { dailyStartState: start, dailyTargetState: target, dailyPathLength: length, shortestPath: shortestPath };
	} else {
		throw new Error(`Invalid challenge generated for date: ${dateKey}`);
	}

	// challenges[dateKey] = {
	// 	dailyStartState: start as string,
	// 	dailyTargetState: target,
	// 	dailyPathLength: length,
	// 	shortestPath: shortestPath
	// };
}

// Write output to JSON file
const filePath = path.join(__dirname, '../src/lib/validChallenges.json'); // Save inside src/lib/
fs.writeFileSync(filePath, JSON.stringify(challenges, null, 2));

console.log(`✅ Generated 5 years of daily challenges! Saved to ${filePath}`);
