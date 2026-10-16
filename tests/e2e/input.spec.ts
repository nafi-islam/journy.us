// the guess input uses skeleton 5's combobox as-is (arrow keys move through the suggestions,
// enter picks one, tab leaves the field). journy only adds what v1 did after a pick: the
// input is filled and the guess button is focused, so enter guesses

import { expect, test } from '@playwright/test';
import { guessChips, mainButton, openDaily } from './helpers';

test('picking a suggestion with the keyboard focuses the guess button, enter guesses', async ({
	page
}) => {
	await openDaily(page);
	const input = page.getByPlaceholder('Enter a state...');

	await input.pressSequentially('wyo');
	await input.press('ArrowDown');
	await input.press('Enter');
	await expect(input).toHaveValue('Wyoming');
	await expect(mainButton(page)).toBeFocused();

	await page.keyboard.press('Enter');
	await expect(guessChips(page)).toHaveText(['🟩 Wyoming']);
});
