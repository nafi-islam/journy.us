// shared helpers for the journy browser tests

import { expect, type Page } from '@playwright/test';

// the daily on utc 2026-10-11 (challenge #553): utah -> tennessee, optimal 3, budget 6
// best path: utah -> wyoming -> nebraska -> missouri -> tennessee
export const TEST_DAY = new Date('2026-10-11T15:00:00Z');
export const TEST_DATE_KEY = '2026-10-11';
export const OPTIMAL_GUESSES = ['Wyoming', 'Nebraska', 'Missouri'];

// Function to open the daily challenge with the clock frozen on the test day
export async function openDaily(page: Page) {
	await page.clock.setFixedTime(TEST_DAY);
	await page.goto('/');
	await expect(page.getByText('to go from')).toContainText('Utah');
	await expect(page.getByText('to go from')).toContainText('Tennessee');
}

// Function to type a state into the guess input and press enter (like a player would)
export async function guess(page: Page, state: string) {
	const input = page.getByPlaceholder('Enter a state...');
	await input.fill(state);
	await input.press('Enter');
}

// Function to get the guess chips under "past guesses:"
export function guessChips(page: Page) {
	return page.locator('div.w-\\[140px\\]');
}

// Function to get the main button (guess / practice / play again)
export function mainButton(page: Page) {
	return page.getByRole('button', { name: /^(Guess|Practice|Play Again)/ });
}

// Function to open one of the header modals (they are icon buttons without labels in v1)
export async function openHeaderModal(page: Page, which: 'stats' | 'settings' | 'help') {
	const index = { stats: 0, settings: 1, help: 2 }[which];
	await page.locator('#shell-header button').nth(index).click();
}

// Function to close whatever modal is open
export async function closeModal(page: Page) {
	await page.keyboard.press('Escape');
}

// Function to read a localStorage key as json
export async function readStorage(page: Page, key: string) {
	return page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);
}
