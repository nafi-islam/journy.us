// daily challenge flows. these pin v1 behavior (including the localStorage contract)
// so the v2 refactor can be checked against them

import { expect, test } from '@playwright/test';
import pkg from '../../package.json' with { type: 'json' };
import {
	OPTIMAL_GUESSES,
	TEST_DATE_KEY,
	closeModal,
	guess,
	guessChips,
	mainButton,
	openDaily,
	openDialog,
	openHeaderModal,
	readStorage,
	statTile
} from './helpers';

test('shows the daily puzzle with a budget of optimal + 3', async ({ page }) => {
	await openDaily(page);
	await expect(page.getByText('your journy today is...')).toBeVisible();
	await expect(mainButton(page)).toHaveText('Guess (1 / 6)');
	await expect(page.getByText(`v${pkg.version}`, { exact: true })).toBeVisible(); // header version chip
});

test('an optimal win shows the result and writes the v1 localStorage contract', async ({
	page
}) => {
	await openDaily(page);
	for (const state of OPTIMAL_GUESSES) await guess(page, state);

	await expect(openDialog(page).getByText('Challenge #553')).toBeVisible();
	await expect(openDialog(page).getByText('Congratulations!')).toBeVisible();

	// exact v1 shapes (see CLAUDE.md localStorage contract). v2 only adds optional fields:
	// resultSeen marks that the result modal was shown (v1 ignores it)
	expect(await readStorage(page, 'journyDailyStats')).toEqual({
		[TEST_DATE_KEY]: { guessedStates: OPTIMAL_GUESSES, guessCount: 3, won: true, resultSeen: true }
	});
	expect(await readStorage(page, 'journyStats')).toEqual({
		[TEST_DATE_KEY]: { won: true, guessCount: 3, shortestPathLength: 3, isDaily: true }
	});
	expect(await readStorage(page, 'journyStorageVersion')).toBe(2);

	await closeModal(page);
	await expect(mainButton(page)).toHaveText('Practice');
});

test('a loss shows the shortest route and records the result', async ({ page }) => {
	await openDaily(page);
	for (const state of ['Maine', 'Florida', 'Texas', 'Ohio', 'Oregon', 'Vermont']) {
		await guess(page, state);
	}

	await expect(openDialog(page).getByText('Better luck next time!')).toBeVisible();
	await expect(
		openDialog(page).getByText('Utah ➡️ Wyoming ➡️ Nebraska ➡️ Missouri ➡️ Tennessee')
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

test('a brand new player sees 0% instead of NaN', async ({ page }) => {
	await openDaily(page);
	await openHeaderModal(page, 'stats');
	await expect(statTile(page, 'Win Rate')).toHaveText('0%');
	await expect(statTile(page, 'Played')).toHaveText('0');
});

test('a finished daily still shows the practice button after a reload', async ({ page }) => {
	await openDaily(page);
	for (const state of OPTIMAL_GUESSES) await guess(page, state);
	await expect(openDialog(page).getByText('Challenge #553')).toBeVisible();

	await page.reload();
	await expect(guessChips(page)).toHaveCount(3);
	await expect(mainButton(page)).toHaveText('Practice');
});

test('the result modal is not replayed after a reload', async ({ page }) => {
	await openDaily(page);
	for (const state of OPTIMAL_GUESSES) await guess(page, state);
	await expect(openDialog(page).getByText('Challenge #553')).toBeVisible();
	expect((await readStorage(page, 'journyDailyStats'))[TEST_DATE_KEY].resultSeen).toBe(true);

	await page.reload();
	await expect(guessChips(page)).toHaveCount(3);
	await page.waitForTimeout(1_500); // the modal used to open 500ms after load
	await expect(openDialog(page)).toHaveCount(0);
});
