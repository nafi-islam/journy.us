const STORAGE_KEY = 'journyStats';

export function loadStats(): Record<string, any> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch (err) {
		console.error('Failed to load stats:', err);
		return {};
	}
}

export function saveStats(stats: Record<string, any>) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
		console.log('saveStats:', stats);
	} catch (err) {
		console.error('Failed to save stats:', err);
	}
}
