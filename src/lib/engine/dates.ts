// date keys (YYYY-MM-DD) and challenge numbers
// day math goes through Date.UTC so daylight saving changes can't shift a day

const ONE_DAY = 1000 * 60 * 60 * 24;

// journy's daily challenge #1
export const CHALLENGE_START_DATE = '2025-04-07';

// Function to build a date key from a year, a month (1-12) and a day
function toDateKey(year: number, month: number, day: number): string {
	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Function to get the utc date key (how v1 picked the daily)
export function utcDateKey(date: Date = new Date()): string {
	return date.toISOString().split('T')[0];
}

// Function to get the player's local date key
export function localDateKey(date: Date = new Date()): string {
	return toDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

// Function to turn a date key into a utc timestamp at midnight
function dateKeyToUtc(dateKey: string): number {
	const [year, month, day] = dateKey.split('-').map(Number);
	return Date.UTC(year, month - 1, day);
}

// Function to count calendar days from one date key to another
export function daysBetween(from: string, to: string): number {
	return Math.round((dateKeyToUtc(to) - dateKeyToUtc(from)) / ONE_DAY);
}

// Function to move a date key by a number of days
export function addDays(dateKey: string, days: number): string {
	return utcDateKey(new Date(dateKeyToUtc(dateKey) + days * ONE_DAY));
}

// Function to get the challenge number for a date (2025-04-07 is #1)
export function getChallengeNumber(dateKey: string): number {
	return daysBetween(CHALLENGE_START_DATE, dateKey) + 1;
}
