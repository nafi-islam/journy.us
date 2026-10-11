// confetti when the player wins (same burst as v1, loaded only when needed)

type Confetti = (options: Record<string, unknown>) => void;

let cachedConfetti: Confetti | null = null;

// Function to trigger confetti when the user wins
export async function celebrate() {
	if (typeof window === 'undefined') return;

	if (!cachedConfetti) {
		cachedConfetti = (await import('canvas-confetti')).default as Confetti;
	}

	cachedConfetti({
		particleCount: 100,
		spread: 70,
		origin: { y: 0.8 },
		disableForReducedMotion: true
	});
}
