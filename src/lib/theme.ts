// light / dark mode
// v1 used skeleton 2's light switch, which stored json booleans (true = light) under
// modeUserPrefers and modeCurrent. v2 keeps those keys so the choice survives a rollback.
// the saved choice is applied before the page paints by a small script in app.html

const USER_PREFERS_KEY = 'modeUserPrefers';
const CURRENT_KEY = 'modeCurrent';

// Function to check if light mode is on right now
export function isLightMode(): boolean {
	return !document.documentElement.classList.contains('dark');
}

// Function to switch light / dark mode and remember the choice
export function setLightMode(light: boolean) {
	document.documentElement.classList.toggle('dark', !light);
	// browser bar color: surface-50 / surface-950 (same as the page background in app.css)
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute('content', light ? '#e3e3e3' : '#181410');
	try {
		localStorage.setItem(USER_PREFERS_KEY, JSON.stringify(light));
		localStorage.setItem(CURRENT_KEY, JSON.stringify(light));
	} catch (err) {
		console.error('Failed to save the color mode:', err);
	}
}
