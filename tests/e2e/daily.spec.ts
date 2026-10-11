// daily challenge flows. these pin v1 behavior (including the localStorage contract)
// so the v2 refactor can be checked against them

import { expect, test } from '@playwright/test';
import {
	OPTIMAL_GUESSES,
	TEST_DATE_KEY,
	closeModal,
	guess,
	guessChips,
	mainButton,
	openDaily,
	readStorage
} from './helpers';

test('shows the daily puzzle with a budget of optimal + 3', async ({ page }) => {
	await openDaily(page);
	await expect(page.getByText('your journy today is...')).toBeVisible();
	await expect(mainButton(page)).toHaveText('Guess (1 / 6)');
});

test('an optimal win shows the result and writes the v1 localStorage contract', async ({
	page
}) => {
	await openDaily(page);
	for (const state of OPTIMAL_GUESSES) await guess(page, state);

	await expect(page.getByText('Challenge #553')).toBeVisible();
	await expect(page.getByText('Congratulations!')).toBeVisible();

	// exact v1 shapes. v2 must be able to import these (see CLAUDE.md localStorage contract)
	expect(await readStorage(page, 'journyDailyStats')).toEqual({
		[TEST_DATE_KEY]: { guessedStates: OPTIMAL_GUESSES, guessCount: 3, won: true }
	});
	expect(await readStorage(page, 'journyStats')).toEqual({
		[TEST_DATE_KEY]: { won: true, guessCount: 3, shortestPathLength: 3, isDaily: true }
	});

	await closeModal(page);
	await expect(mainButton(page)).toHaveText('Practice');
});

test('a loss shows the shortest route and records the result', async ({ page }) => {
	await openDaily(page);
	for (const state of ['Maine', 'Florida', 'Texas', 'Ohio', 'Oregon', 'Vermont']) {
		await guess(page, state);
	}

	await expect(page.getByText('Better luck next time!')).toBeVisible();
	await expect(
		page.getByText('Utah ➡️ Wyoming ➡️ Nebraska ➡️ Missouri ➡️ Tennessee')
	).toBeVisible();
	expect(await readStorage(page, 'journyStats')).toEqual({
		[TEST_DATE_KEY]: { won: false, guessCount: 6, shortestPathLength: 3, isDaily: true }
	});
});

test('guess chips show the guess guide', async ({ page }) => {
	await openDaily(page);
	await guess(page, 'Wyoming');
	await guess(page, 'Texas');
	await guess(page, 'Maine');

	await expect(guessChips(page)).toHaveText(['🟩 Wyoming', '🟧 Texas', '🟥 Maine']);
	await expect(mainButton(page)).toHaveText('Guess (4 / 6)');
});

test('in-progress guesses survive a reload', async ({ page }) => {
	await openDaily(page);
	await guess(page, 'Wyoming');
	await expect(guessChips(page)).toHaveCount(1);

	await page.reload();
	await expect(guessChips(page)).toHaveText(['🟩 Wyoming']);
	// the button label after a reload is bug 9 (see bugs.spec.ts)
});

test('an invalid state shows a toast and does not count', async ({ page }) => {
	await openDaily(page);
	await guess(page, 'Narnia');

	await expect(page.getByText('invalid state name!')).toBeVisible();
	await expect(guessChips(page)).toHaveCount(0);
	await expect(mainButton(page)).toHaveText('Guess (1 / 6)');
});

test('share copies the v1 text format', async ({ page }) => {
	await openDaily(page);
	for (const state of OPTIMAL_GUESSES) await guess(page, state);

	await page.getByRole('button', { name: 'Share' }).click();
	await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();

	const clipboard = await page.evaluate(() => navigator.clipboard.readText());
	expect(clipboard).toBe('journy #553 3/6\n🟩🟩🟩\nhttps://www.journy.us/');
});
