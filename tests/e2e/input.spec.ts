// the guess input. skeleton 5's combobox moves through suggestions with the arrow keys; journy
// adds tab-to-complete (v1's skeleton 2 autocomplete let tab move through its suggestions)

import { expect, test } from '@playwright/test';
import { guessChips, mainButton, openDaily } from './helpers';

test('tab completes the typed text with the first match, enter guesses it', async ({ page }) => {
	await openDaily(page);
	const input = page.getByPlaceholder('Enter a state...');

	await input.fill('wyo');
	await input.press('Tab');
	await expect(input).toHaveValue('Wyoming');
	await expect(input).toBeFocused();

	await input.press('Enter');
	await expect(guessChips(page)).toHaveText(['🟩 Wyoming']);
});

test('tab completes the suggestion highlighted with the arrow keys', async ({ page }) => {
	await openDaily(page);
	const input = page.getByPlaceholder('Enter a state...');

	await input.fill('new');
	await input.press('ArrowDown'); // new hampshire
	await input.press('ArrowDown'); // new jersey
	await input.press('Tab');
	await expect(input).toHaveValue('New Jersey');
});

test('tab on a complete name or an empty box moves on to the guess button', async ({ page }) => {
	await openDaily(page);
	const input = page.getByPlaceholder('Enter a state...');

	await input.fill('Wyoming');
	await input.press('Tab');
	await expect(mainButton(page)).toBeFocused();

	await input.fill('');
	await input.focus();
	await input.press('Tab');
	await expect(mainButton(page)).toBeFocused();
});
