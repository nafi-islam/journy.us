// practice mode flows (v1 behavior)

import { expect, test } from '@playwright/test';
import {
	OPTIMAL_GUESSES,
	TEST_DATE_KEY,
	closeModal,
	guess,
	guessChips,
	mainButton,
	openDaily,
	readStorage,
	toggleGameMode,
	mapStates
} from './helpers';

test('after the daily, practice starts a new puzzle with the full map', async ({ page }) => {
	await openDaily(page);

	// the daily map only draws the start and target
	await expect(mapStates(page)).toHaveCount(2);

	for (const state of OPTIMAL_GUESSES) await guess(page, state);
	await closeModal(page);
	await mainButton(page).click();

	await expect(page.getByText('your journy now is...')).toBeVisible();
	await expect(guessChips(page)).toHaveCount(0);
	expect(await mapStates(page).count()).toBeGreaterThanOrEqual(48);
});

test('practice guesses are not saved to the daily storage', async ({ page }) => {
	await openDaily(page);
	for (const state of OPTIMAL_GUESSES) await guess(page, state);
	await closeModal(page);
	await mainButton(page).click();
	await expect(page.getByText('your journy now is...')).toBeVisible();

	await guess(page, 'Maine');

	expect(await readStorage(page, 'journyDailyStats')).toEqual({
		[TEST_DATE_KEY]: { guessedStates: OPTIMAL_GUESSES, guessCount: 3, won: true, resultSeen: true }
	});
});

test('switching back from practice restores the daily and its progress', async ({ page }) => {
	await openDaily(page);
	await guess(page, 'Wyoming');

	await toggleGameMode(page);
	await expect(page.getByText('your journy now is...')).toBeVisible();
	await expect(guessChips(page)).toHaveCount(0);

	await toggleGameMode(page);
	await expect(page.getByText('your journy today is...')).toBeVisible();
	await expect(page.getByText('to go from')).toHaveText('to go from Utah to Tennessee');
	await expect(guessChips(page)).toHaveText(['🟩 Wyoming']);
});
