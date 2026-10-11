import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	test: {
		// unit tests live next to the code (e2e tests live in tests/e2e and run with playwright)
		include: ['src/**/*.test.ts']
	}
});
