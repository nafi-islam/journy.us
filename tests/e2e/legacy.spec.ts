// legacy daily puzzles (static/validChallenges.json) were generated with the v1 graph, where
// arizona and colorado were neighbors (four corners). they must play exactly as before

import { expect, test } from '@playwright/test';
import { guess, mainButton } from './helpers';

test('a legacy daily that crosses the four corners plays as it did in v1', async ({ page }) => {
	// 2026-10-17: pennsylvania -> arizona, optimal 5 through colorado -> arizona
	await page.clock.setFixedTime(new Date('2026-10-17T15:00:00Z'));
	await page.goto('/');
	await expect(page.getByText('to go from')).toHaveText('to go from Pennsylvania to Arizona');
	await expect(mainButton(page)).toHaveText('Guess (1 / 8)');

	for (const state of ['West Virginia', 'Kentucky', 'Missouri', 'Nebraska', 'Colorado']) {
		await guess(page, state);
	}

	await expect(page.getByText('Congratulations!')).toBeVisible();
	await expect(page.getByText('in 5 guesses.')).toBeVisible();
});
