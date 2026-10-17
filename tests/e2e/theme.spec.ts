// light / dark mode. v2 keeps skeleton v2's localStorage keys (modeUserPrefers / modeCurrent,
// json booleans, true = light) so the choice survives a rollback to v1

import { expect, test } from '@playwright/test';
import { closeModal, openDaily, openHeaderModal, readStorage, toggleGameMode } from './helpers';

// Function to turn a css color (rgb() or oklch(), as browsers report them) into relative luminance
function luminance(color: string): number {
	const numbers = (color.match(/[\d.]+/g) ?? []).map(Number);
	let rgb: number[];
	if (color.startsWith('oklch')) {
		const [L, C, h] = numbers;
		const a = C * Math.cos((h * Math.PI) / 180);
		const b = C * Math.sin((h * Math.PI) / 180);
		const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
		const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
		const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
		rgb = [
			4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
			-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
			-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
		].map((channel) => Math.min(1, Math.max(0, channel)));
	} else {
		rgb = numbers.slice(0, 3).map((channel) => {
			const c = channel / 255;
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
	}
	return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

// Function to compute the wcag contrast ratio between two css colors
function contrast(a: string, b: string): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

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

	// Function to read the map's colors in practice mode (every state drawn)
	async function mapColors(page: import('@playwright/test').Page) {
		return page.evaluate(() => {
			const fills = [...document.querySelectorAll('[data-testid="map-fills"] path')].map(
				(path) => getComputedStyle(path).fill
			);
			// the unplayed gray is the most common fill (only start / target differ in practice)
			const counts = new Map<string, number>();
			for (const fill of fills) counts.set(fill, (counts.get(fill) ?? 0) + 1);
			const unplayed = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
			const border = document.querySelector('[data-testid="map-borders"] path')!;
			return {
				fills,
				unplayed,
				border: getComputedStyle(border).stroke,
				frame: getComputedStyle(document.querySelector('[data-testid="map-frame"]')!)
					.borderTopColor,
				background: getComputedStyle(document.body).backgroundColor
			};
		});
	}

	for (const mode of ['dark', 'light'] as const) {
		test(`the map is readable on a dim screen in ${mode} mode (contrast)`, async ({ page }) => {
			await openDaily(page);
			if (mode === 'light') {
				await openHeaderModal(page, 'settings');
				await page.getByTestId('color-mode-switch').click();
				await closeModal(page);
			}
			await toggleGameMode(page); // practice draws every state

			const colors = await mapColors(page);
			expect(colors.fills).not.toContain('rgb(0, 0, 0)'); // the old invalid-color bug

			// wcag asks for 3:1 for shapes and borders. this is what makes the states and their
			// borders readable with the screen brightness turned down
			expect(
				contrast(colors.unplayed, colors.background),
				'states vs background'
			).toBeGreaterThanOrEqual(3);
			expect(contrast(colors.border, colors.unplayed), 'borders vs states').toBeGreaterThanOrEqual(
				3
			);
			// the map's frame should be clearly visible too
			expect(
				contrast(colors.frame, colors.background),
				'frame vs background'
			).toBeGreaterThanOrEqual(2.5);
		});
	}

	test('hovering a state does not reveal its name', async ({ page }) => {
		await openDaily(page);
		await toggleGameMode(page);
		await expect(page.locator('[data-testid="map"] title')).toHaveCount(0);
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

// safari on ios 26 tints the strip behind the clock from the page and sticky header background.
// those must be plain colors for journy's chosen mode (not light-dark(), which safari resolved
// from the phone's setting), and the theme-color tag must follow the mode too
test.describe('the browser bar colors follow the chosen mode, not the phone', () => {
	test.use({ colorScheme: 'light' }); // phone in light mode

	// Function to read the colors the browser chrome can sample
	async function chromeColors(page: import('@playwright/test').Page) {
		return page.evaluate(() => ({
			html: getComputedStyle(document.documentElement).backgroundColor,
			body: getComputedStyle(document.body).backgroundColor,
			header: getComputedStyle(document.querySelector('#app-header')!).backgroundColor,
			headerBlur: getComputedStyle(document.querySelector('#app-header')!).backdropFilter,
			themeColor: document.querySelector('meta[name="theme-color"]')!.getAttribute('content')
		}));
	}

	test('switching to dark on a light phone updates the page, header and theme-color', async ({
		page
	}) => {
		await openDaily(page);
		const light = await chromeColors(page);
		expect(light.themeColor).toBe('#e3e3e3');
		expect(light.header).toBe(light.html); // solid header, same color as the page
		expect(light.body).toBe(light.html);
		expect(light.headerBlur).toBe('none');

		await openHeaderModal(page, 'settings');
		await page.getByTestId('color-mode-switch').click();
		await closeModal(page);

		const dark = await chromeColors(page);
		expect(dark.themeColor).toBe('#181410');
		expect(dark.html).not.toBe(light.html);
		expect(dark.header).toBe(dark.html);
		expect(dark.body).toBe(dark.html);
		// plain colors, so nothing is left for the browser to resolve from the phone's setting
		for (const color of [dark.html, dark.header, light.html, light.header]) {
			expect(color).not.toContain('light-dark');
		}
	});

	test('a saved dark choice sets the theme-color before the page paints', async ({ page }) => {
		await page.addInitScript(() => localStorage.setItem('modeUserPrefers', 'false'));
		await page.goto('/');
		expect(
			await page.evaluate(() =>
				document.querySelector('meta[name="theme-color"]')!.getAttribute('content')
			)
		).toBe('#181410');
	});
});
