// light / dark mode. v2 keeps skeleton v2's localStorage keys (modeUserPrefers / modeCurrent,
// json booleans, true = light) so the choice survives a rollback to v1

import { expect, test } from '@playwright/test';
import { closeModal, openDaily, openHeaderModal, readStorage } from './helpers';

// Function to check if the page is in dark mode
async function isDark(page: import('@playwright/test').Page) {
	return page.evaluate(() => document.documentElement.classList.contains('dark'));
}

test.describe('with a dark os preference', () => {
	test.use({ colorScheme: 'dark' });

	test('follows the os by default', async ({ page }) => {
		await openDaily(page);
		expect(await isDark(page)).toBe(true);
	});

	test('switching to light is saved in the v1 keys and survives a reload', async ({ page }) => {
		await openDaily(page);
		await openHeaderModal(page, 'settings');
		await page.getByTestId('color-mode-switch').click();
		await closeModal(page);

		expect(await isDark(page)).toBe(false);
		expect(await readStorage(page, 'modeUserPrefers')).toBe(true);
		expect(await readStorage(page, 'modeCurrent')).toBe(true);

		await page.reload();
		expect(await isDark(page)).toBe(false);
	});
});

test.describe('with a light os preference', () => {
	test.use({ colorScheme: 'light' });

	test('a saved dark choice from v1 is applied before the page paints', async ({ page }) => {
		await page.addInitScript(() => localStorage.setItem('modeUserPrefers', 'false'));
		await page.goto('/');
		// checked right away, before the app has hydrated
		expect(await isDark(page)).toBe(true);
	});
});
