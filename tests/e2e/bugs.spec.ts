// known v1 bugs, written as the behavior we want. test.fail() means "this is expected to fail
// on v1". when a milestone fixes a bug, remove test.fail() so it becomes a normal test
// debugging: run `SHOW_V1_BUGS=1 npx playwright test bugs` to see the real failure messages

import { expect, test } from '@playwright/test';
import {
	OPTIMAL_GUESSES,
	TEST_DATE_KEY,
	closeModal,
	guess,
	guessChips,
	mainButton,
	openDaily,
	openHeaderModal,
	readStorage
} from './helpers';

// bug 1: the enter key in the guess input bypasses the button logic after the game is over
test('bug 1: guesses are rejected after the daily is finished', async ({ page }) => {
	test.fail(!process.env.SHOW_V1_BUGS, 'known v1 bug');

	await openDaily(page);
	for (const state of OPTIMAL_GUESSES) await guess(page, state);
	await expect(page.getByText('Challenge #553')).toBeVisible();
	await closeModal(page);

	await guess(page, 'Colorado');

	await expect(guessChips(page)).toHaveCount(3, { timeout: 2_000 });
	expect(await readStorage(page, 'journyStats')).toEqual({
		[TEST_DATE_KEY]: { won: true, guessCount: 3, shortestPathLength: 3, isDaily: true }
	});
});

// bug 2: switching to practice before guessing keeps the daily puzzle (full map + answer)
test('bug 2: practice never reuses the daily puzzle', async ({ page }) => {
	test.fail(!process.env.SHOW_V1_BUGS, 'known v1 bug');

	await openDaily(page);
	await openHeaderModal(page, 'settings');
	await page.getByRole('switch', { name: 'Daily Challenge' }).click();
	await closeModal(page);

	await expect(page.getByText('your journy now is...')).toBeVisible();
	await expect(page.getByText('to go from')).not.toHaveText('to go from Utah to Tennessee', {
		timeout: 2_000
	});
});

// bug 9: after a mid-game reload the button says "practice" because Prompt sets showPractice
// whenever today has any saved progress (finished or not)
test('bug 9: the guess button survives a mid-game reload', async ({ page }) => {
	test.fail(!process.env.SHOW_V1_BUGS, 'known v1 bug');

	await openDaily(page);
	await guess(page, 'Wyoming');
	await expect(guessChips(page)).toHaveCount(1);

	await page.reload();
	await expect(guessChips(page)).toHaveCount(1);
	await expect(mainButton(page)).toHaveText('Guess (2 / 6)', { timeout: 2_000 });
});

// bug 3: the streak only resets on a loss, skipped days are ignored
test('bug 3: skipping a day breaks the current streak', async ({ page }) => {
	test.fail(!process.env.SHOW_V1_BUGS, 'known v1 bug');

	// wins on 10-07, 10-08, 10-10 and 10-11 (10-09 skipped). expected current streak: 2
	await page.addInitScript(() => {
		const win = (guessCount: number) => ({
			won: true,
			guessCount,
			shortestPathLength: 3,
			isDaily: true
		});
		localStorage.setItem(
			'journyStats',
			JSON.stringify({
				'2026-10-07': win(3),
				'2026-10-08': win(4),
				'2026-10-10': win(3),
				'2026-10-11': win(3)
			})
		);
	});

	await openDaily(page);
	await openHeaderModal(page, 'stats');

	const currentStreak = page
		.locator('div.flex-1', { hasText: 'Current Streak' })
		.locator('p')
		.first();
	await expect(currentStreak).toHaveText('2', { timeout: 2_000 });
});
