// layout checks on small phones: no text may be cut off or stick out of its box, and the page
// must never scroll sideways. (this caught "100%" overflowing its stat tile on a 360px phone)

import { expect, test, type Locator, type Page } from '@playwright/test';
import {
	OPTIMAL_GUESSES,
	closeModal,
	guess,
	openDaily,
	openDialog,
	openHeaderModal,
	toggleGameMode
} from './helpers';

// Function to list elements inside a root whose content is wider than the element itself
// (text that is cut off, or pushed outside its box). scrolling containers are allowed
async function findOverflow(root: Locator): Promise<string[]> {
	// measure only once animations are done (a chevron mid-rotation is briefly wider than its box).
	// endless animations (like a spinner) never finish, so those are skipped
	await root.page().evaluate(() =>
		Promise.all(
			document
				.getAnimations()
				.filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
				.map((animation) => animation.finished.catch(() => {}))
		)
	);
	return root.evaluate((element) => {
		const problems: string[] = [];
		for (const el of [element, ...element.querySelectorAll('*')] as HTMLElement[]) {
			if (el instanceof SVGElement || el.offsetParent === null) continue; // svg / hidden
			const { overflowX } = getComputedStyle(el);
			if (overflowX === 'auto' || overflowX === 'scroll') continue;
			if (el.scrollWidth > el.clientWidth + 1) {
				const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
				problems.push(
					`<${el.tagName.toLowerCase()}> "${text}" needs ${el.scrollWidth}px, has ${el.clientWidth}px`
				);
			}
		}
		return problems;
	});
}

// Function to check the page itself never scrolls sideways
async function expectNoSidewaysScroll(page: Page) {
	const { scrollWidth, innerWidth } = await page.evaluate(() => ({
		scrollWidth: document.documentElement.scrollWidth,
		innerWidth: window.innerWidth
	}));
	expect(scrollWidth, 'page scrolls sideways').toBeLessThanOrEqual(innerWidth);
}

for (const width of [320, 375]) {
	test.describe(`on a ${width}px phone`, () => {
		test.use({ viewport: { width, height: 740 } });

		test('the game page fits', async ({ page }) => {
			await openDaily(page);
			await guess(page, 'Wyoming');
			await guess(page, 'Texas');
			await expectNoSidewaysScroll(page);
			expect(await findOverflow(page.locator('body'))).toEqual([]);

			// the footer groups ("powered by", "made by nafi with") never break across lines
			for (const group of await page.locator('footer > span').all()) {
				const lines = await group.evaluate((el) =>
					Math.round(
						el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)
					)
				);
				expect(lines, await group.innerText()).toBe(1);
			}
		});

		test('the stats dialog fits after a 100% win', async ({ page }) => {
			await openDaily(page);
			for (const state of OPTIMAL_GUESSES) await guess(page, state);
			await expect(openDialog(page).getByText('100%')).toBeVisible();
			await expectNoSidewaysScroll(page);
			expect(await findOverflow(openDialog(page))).toEqual([]);
		});

		test('the help dialog fits with every section open', async ({ page }) => {
			await openDaily(page);
			await openHeaderModal(page, 'help');
			for (const section of ['Credits', 'Feedback', 'Patch Notes']) {
				await openDialog(page).getByRole('button', { name: section }).click();
			}
			expect(await findOverflow(openDialog(page))).toEqual([]);
		});

		test('the settings dialog fits', async ({ page }) => {
			await openDaily(page);
			await openHeaderModal(page, 'settings');
			expect(await findOverflow(openDialog(page))).toEqual([]);
		});

		test('the practice result dialog fits', async ({ page }) => {
			await openDaily(page);
			await toggleGameMode(page);
			// lose on purpose: wrong guesses until the practice result opens
			for (const state of [
				'Maine',
				'Florida',
				'Oregon',
				'Vermont',
				'Michigan',
				'Ohio',
				'Idaho',
				'Texas',
				'Nevada',
				'Kansas',
				'Georgia',
				'Montana'
			]) {
				await guess(page, state);
				// the result opens ~500ms after the last guess. typing again would count as a click
				// outside the dialog and close it, so wait for it before the next guess
				const opened = await openDialog(page)
					.waitFor({ timeout: 1_000 })
					.then(() => true)
					.catch(() => false);
				if (opened) break;
			}
			await expect(openDialog(page)).toBeVisible();
			expect(await findOverflow(openDialog(page))).toEqual([]);
			await closeModal(page);
		});
	});
}
