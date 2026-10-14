// skeleton 5 light / dark color pairs (e.g. bg-surface-100-900) only exist when the two shades
// add up to 1000. any other pair (e.g. fill-surface-300-600) silently generates no css, which
// once turned every unplayed map state black. this test scans the components for bad pairs

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

const COLORS = 'primary|secondary|tertiary|success|warning|error|surface';
const PAIR = new RegExp(`[a-z-]+-(?:${COLORS})-(\\d{2,3})-(\\d{2,3})(?:/\\d+)?`, 'g');

// Function to list every .svelte file under a folder
function svelteFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return svelteFiles(path);
		return entry.name.endsWith('.svelte') ? [path] : [];
	});
}

describe('skeleton color pairs', () => {
	it('only uses pairs whose shades add up to 1000', () => {
		const bad: string[] = [];
		for (const file of [...svelteFiles('src/lib'), ...svelteFiles('src/routes')]) {
			for (const match of readFileSync(file, 'utf8').matchAll(PAIR)) {
				if (Number(match[1]) + Number(match[2]) !== 1000) bad.push(`${file}: ${match[0]}`);
			}
		}
		expect(bad).toEqual([]);
	});
});
