import { defineConfig } from '@playwright/test';

// browser tests for journy. they run against a production build (vite preview)
// and use the installed google chrome, so no playwright browser download is needed
export default defineConfig({
	testDir: 'tests/e2e',
	timeout: 30_000,
	expect: { timeout: 10_000 },
	reporter: 'list',
	use: {
		baseURL: 'http://localhost:4173',
		channel: 'chrome',
		permissions: ['clipboard-read', 'clipboard-write']
	},
	webServer: {
		command: 'npm run build && npm run preview -- --port 4173 --strictPort',
		port: 4173,
		reuseExistingServer: true,
		timeout: 180_000
	}
});
