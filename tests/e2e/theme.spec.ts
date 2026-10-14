// light / dark mode. v2 keeps skeleton v2's localStorage keys (modeUserPrefers / modeCurrent,
// json booleans, true = light) so the choice survives a rollback to v1

import { expect, test } from '@playwright/test';
import { closeModal, openDaily, openHeaderModal, readStorage, toggleGameMode } from './helpers';

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

test.describe('the map in both modes', () => {
	test.use({ colorScheme: 'dark' });

	// Function to read the fill of an unplayed state and the border color in practice mode
	async function mapColors(page: import('@playwright/test').Page) {
		return page.evaluate(() => {
			const fills = [...document.querySelectorAll('[data-testid="map-fills"] path')].map(
				(path) => getComputedStyle(path).fill
			);
			const border = document.querySelector('[data-testid="map-borders"] path')!;
			return { fills, border: getComputedStyle(border).stroke };
		});
	}

	test('unplayed states are gray (never black) and follow the light / dark toggle', async ({
		page
	}) => {
		await openDaily(page);
		await toggleGameMode(page); // practice draws every state

		const dark = await mapColors(page);
		expect(dark.fills).not.toContain('rgb(0, 0, 0)');

		await openHeaderModal(page, 'settings');
		await page.getByTestId('color-mode-switch').click();
		await closeModal(page);

		const light = await mapColors(page);
		expect(light.fills).not.toContain('rgb(0, 0, 0)');
		expect(light.border).not.toBe(dark.border);
		expect(new Set(light.fills)).not.toEqual(new Set(dark.fills));
	});

	test('every drawn state gets a full border, drawn on top of all the fills', async ({ page }) => {
		await openDaily(page);
		await toggleGameMode(page);

		const layers = await page.evaluate(() => {
			const svg = document.querySelector('[data-testid="map"]')!;
			const groups = [...svg.children].map((child) => child.getAttribute('data-testid'));
			return {
				groups,
				fills: svg.querySelectorAll('[data-testid="map-fills"] path').length,
				borders: svg.querySelectorAll('[data-testid="map-borders"] path').length
			};
		});
		expect(layers.groups).toEqual(['map-fills', 'map-borders']);
		expect(layers.borders).toBe(layers.fills);
		expect(layers.fills).toBeGreaterThanOrEqual(48);
	});
});
