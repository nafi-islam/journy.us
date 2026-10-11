// generated dailies (from SWITCH_DATE): computed from the date in the browser, no json download,
// rolling over at the player's local midnight

import { expect, test } from '@playwright/test';
import { getGeneratedPuzzle, getTodayKey, SWITCH_DATE } from '../../src/lib/engine/daily';
import { getChallengeNumber } from '../../src/lib/engine/dates';
import { closeModal, guess, mainButton, setClock } from './helpers';

// Function to read the "to go from x to y" prompt
function promptText(page: import('@playwright/test').Page) {
	return page.getByText('to go from');
}

test.describe('in utc', () => {
	test.use({ timezoneId: 'UTC' });

	test('a generated daily plays without downloading the v1 json', async ({ page }) => {
		const puzzle = getGeneratedPuzzle('2030-04-10');
		const jsonRequests: string[] = [];
		page.on('request', (request) => {
			if (request.url().includes('validChallenges.json')) jsonRequests.push(request.url());
		});

		await setClock(page, new Date('2030-04-10T15:00:00Z'));
		await page.goto('/');
		await expect(promptText(page)).toHaveText(`to go from ${puzzle.start} to ${puzzle.target}`);

		const optimal = puzzle.shortestPath.length - 2;
		await expect(mainButton(page)).toHaveText(`Guess (1 / ${optimal + 3})`);
		expect(jsonRequests).toEqual([]);
	});

	test('winning a generated daily shares the right challenge number', async ({ page }) => {
		const puzzle = getGeneratedPuzzle('2030-04-10');
		const optimal = puzzle.shortestPath.length - 2;

		await setClock(page, new Date('2030-04-10T15:00:00Z'));
		await page.goto('/');
		for (const state of puzzle.shortestPath.slice(1, -1)) await guess(page, state);

		await expect(page.getByText(`Challenge #${puzzle.challengeNumber}`)).toBeVisible();
		await page.getByRole('button', { name: 'Share' }).click();
		const clipboard = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboard).toBe(
			`journy #${puzzle.challengeNumber} ${optimal}/${optimal + 3}\n${'🟩'.repeat(optimal)}\nhttps://www.journy.us/`
		);
		await closeModal(page);
	});
});

test.describe('in chicago', () => {
	test.use({ timezoneId: 'America/Chicago' });

	test("generated dailies roll over at the player's local midnight", async ({ page }) => {
		// 03:00 utc on apr 10 is still 10 pm on apr 9 in chicago
		const puzzle = getGeneratedPuzzle('2030-04-09');
		await setClock(page, new Date('2030-04-10T03:00:00Z'));
		await page.goto('/');
		await expect(promptText(page)).toHaveText(`to go from ${puzzle.start} to ${puzzle.target}`);
	});

	test('the switch night gives one puzzle from utc midnight until local midnight', async ({
		page
	}) => {
		const switchPuzzle = getGeneratedPuzzle(SWITCH_DATE);

		// 02:00 utc on the switch day = 9 pm the evening before in chicago
		const evening = new Date(`${SWITCH_DATE}T02:00:00Z`);
		expect(getTodayKey(evening)).toBe(SWITCH_DATE);
		await setClock(page, evening);
		await page.goto('/');
		await expect(promptText(page)).toHaveText(
			`to go from ${switchPuzzle.start} to ${switchPuzzle.target}`
		);
		expect(getChallengeNumber(SWITCH_DATE)).toBe(switchPuzzle.challengeNumber);
	});
});
