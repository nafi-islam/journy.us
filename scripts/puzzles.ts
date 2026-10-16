/**
 * Prints upcoming daily puzzles so they can be checked before players see them.
 * Legacy dates (before SWITCH_DATE) come from static/validChallenges.json, later dates are
 * generated from the date (src/lib/engine/daily.ts).
 *
 * usage: npm run puzzles -- --from 2026-11-01 --days 30
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
	SWITCH_DATE,
	getGeneratedPuzzle,
	getLegacyPuzzle,
	getTodayKey,
	isLegacyDate
} from '../src/lib/engine/daily';
import { addDays } from '../src/lib/engine/dates';
import type { LegacyChallenges } from '../src/lib/engine/legacy';

// Function to read a --name value from the command line
function readArg(name: string): string | undefined {
	const index = process.argv.indexOf(`--${name}`);
	return index === -1 ? undefined : process.argv[index + 1];
}

const from = readArg('from') ?? getTodayKey();
const days = Number(readArg('days') ?? 14);

if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !Number.isInteger(days) || days < 1) {
	console.error('usage: npm run puzzles -- --from YYYY-MM-DD --days N');
	process.exit(1);
}

const challenges: LegacyChallenges = JSON.parse(
	readFileSync(join(process.cwd(), 'static/validChallenges.json'), 'utf8')
);

console.log(`SWITCH_DATE = ${SWITCH_DATE}\n`);
console.log('date        #      guesses  source     puzzle');

let dateKey = from;
for (let i = 0; i < days; i++) {
	const puzzle = isLegacyDate(dateKey)
		? getLegacyPuzzle(dateKey, challenges)
		: getGeneratedPuzzle(dateKey);

	if (!puzzle) {
		console.log(`${dateKey}  missing from validChallenges.json`);
	} else {
		const optimal = puzzle.shortestPath.length - 2;
		console.log(
			[
				dateKey,
				`#${puzzle.challengeNumber}`.padEnd(6),
				`${optimal}/${optimal + 3}`.padEnd(8),
				puzzle.source.padEnd(10),
				`${puzzle.start} -> ${puzzle.target}  (${puzzle.shortestPath.join(' -> ')})`
			].join(' ')
		);
	}

	dateKey = addDays(dateKey, 1);
}
