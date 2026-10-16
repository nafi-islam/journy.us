// tests for date keys and challenge numbers

import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, getChallengeNumber, localDateKey, utcDateKey } from './dates';

describe('date keys', () => {
	it('utcDateKey matches v1 (toISOString date part)', () => {
		expect(utcDateKey(new Date('2026-10-11T02:31:00Z'))).toBe('2026-10-11');
	});

	it('localDateKey uses the local calendar date', () => {
		const date = new Date(2026, 9, 10, 21, 31); // oct 10, 9:31 pm local time
		expect(localDateKey(date)).toBe('2026-10-10');
	});
});

describe('day math', () => {
	it('counts calendar days between keys', () => {
		expect(daysBetween('2025-04-07', '2026-10-11')).toBe(552);
		expect(daysBetween('2026-10-11', '2026-10-10')).toBe(-1);
	});

	it('is not affected by daylight saving changes', () => {
		// us dst ends 2026-11-01 and starts 2027-03-14
		expect(daysBetween('2026-10-31', '2026-11-02')).toBe(2);
		expect(daysBetween('2027-03-13', '2027-03-15')).toBe(2);
	});

	it('adds days across months, years and leap days', () => {
		expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
		expect(addDays('2027-12-31', 1)).toBe('2028-01-01');
		expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
		expect(addDays('2026-10-11', -1)).toBe('2026-10-10');
	});
});

describe('getChallengeNumber', () => {
	it('starts at #1 on 2025-04-07 (matches v1)', () => {
		expect(getChallengeNumber('2025-04-07')).toBe(1);
		expect(getChallengeNumber('2026-10-11')).toBe(553);
	});
});
