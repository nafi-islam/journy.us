import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import vercel from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// every page is prerendered (see src/routes/+layout.ts), so vercel serves static files
			adapter: vercel()
		})
	],
	test: {
		expect: { requireAssertions: true },
		// unit tests live next to the code (e2e tests live in tests/e2e and run with playwright)
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
