// shared helpers for the journy browser tests

import { expect, type Page } from '@playwright/test';

// the daily on utc 2026-10-11 (challenge #553): utah -> tennessee, optimal 3, budget 6
// best path: utah -> wyoming -> nebraska -> missouri -> tennessee
export const TEST_DAY = new Date('2026-10-11T15:00:00Z');
export const TEST_DATE_KEY = '2026-10-11';
export const OPTIMAL_GUESSES = ['Wyoming', 'Nebraska', 'Missouri'];

// Function to set the browser clock to a moment and let it keep running
// (a frozen clock would also freeze the modal animations)
export async function setClock(page: Page, time: Date) {
	await page.clock.install({ time });
	await page.clock.resume();
}

// Function to open the daily challenge on the test day
export async function openDaily(page: Page) {
	await setClock(page, TEST_DAY);
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
	return page.getByTestId('guess-chip');
}

// Function to get the main button (guess / practice / play again)
export function mainButton(page: Page) {
	return page.getByTestId('main-button');
}

// Function to get the drawn map states
export function mapStates(page: Page) {
	return page.locator('[data-testid="map-fills"] path');
}

// Function to get the open dialog (closed dialogs stay in the page, hidden)
export function openDialog(page: Page) {
	return page.getByRole('dialog').filter({ visible: true });
}

// Function to get the backdrop of the open dialog (skeleton 5 keeps closed dialogs hidden)
function openBackdrop(page: Page) {
	return page.getByTestId('dialog-backdrop').filter({ visible: true });
}

// Function to open one of the header modals (icon buttons labelled for screen readers)
export async function openHeaderModal(page: Page, which: 'stats' | 'settings' | 'help') {
	const label = { stats: 'statistics', settings: 'settings', help: 'how to play' }[which];
	await page.getByRole('button', { name: label, exact: true }).click();
	await expect(openBackdrop(page)).toHaveCount(1);
}

// Function to close whatever modal is open and wait for its fade-out to finish
// (the backdrop disappears first; the dialog itself keeps fading out for a moment, and a click
// during that fade can land on the old dialog, so wait for both)
export async function closeModal(page: Page) {
	// a result dialog opens ~500ms after the last guess, so first wait for a dialog to be open
	await expect(openDialog(page)).toHaveCount(1);
	await page.keyboard.press('Escape');
	await expect(openBackdrop(page)).toHaveCount(0);
	await expect(openDialog(page)).toHaveCount(0);
}

// Function to read one of the stat tiles in the stats modal (played, win rate, streaks)
export function statTile(
	page: Page,
	label: 'Played' | 'Win Rate' | 'Current Streak' | 'Max Streak'
) {
	return page.getByTestId(`stat-${label}`).locator('p').first();
}

// Function to read a localStorage key as json
export async function readStorage(page: Page, key: string) {
	return page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);
}

// Function to flip the game mode switch in the settings modal (daily <-> practice)
// (settings closes itself after a game mode change, so the new puzzle is visible)
export async function toggleGameMode(page: Page) {
	await openHeaderModal(page, 'settings');
	await page.getByTestId('game-mode-switch').click();
	await expect(openBackdrop(page)).toHaveCount(0);
	await expect(openDialog(page)).toHaveCount(0);
}
