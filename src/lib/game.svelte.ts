// the game state for the ui (svelte 5 runes)
// v1 spread this across 20 stores and the Prompt / GuessInput / GameStatus components.
// it now lives in one object; the rules themselves stay in src/lib/engine (plain typescript)

import { statesGraph, type StatesGraph } from './engine/statesGraph.ts';
import { evaluateGame, isGameOver, isWin, type GameEvaluation } from './engine/rules.ts';
import { checkGuess, type GuessCheck } from './engine/game.ts';
import { getRandomStatePair } from './engine/practice.ts';
import {
	getGeneratedPuzzle,
	getLegacyPuzzle,
	getTodayKey,
	isLegacyDate,
	type DailyPuzzle
} from './engine/daily.ts';
import {
	ensureStorageVersion,
	loadDailyProgress,
	markDailyResultSeen,
	recordDailyResult,
	saveDailyProgress
} from './engine/storage.ts';
import { celebrate } from './confetti.ts';

export type DialogName = 'stats' | 'settings' | 'help' | 'practice-result' | null;

// v1 showed "finding your journy..." for a moment on first load
const FIRST_LOAD_DELAY = 800;
// v1 opened the result modal shortly after the last guess
const RESULT_DELAY = 500;

class JournyGame {
	// the puzzle on screen (daily or practice)
	start = $state('');
	target = $state('');
	graph = $state.raw<StatesGraph>(statesGraph); // legacy dailies use the v1 graph
	guessedStates = $state<string[]>([]);

	// today's daily (kept so switching back from practice doesn't refetch)
	daily = $state.raw<DailyPuzzle | null>(null);

	practiceMode = $state(false);
	isLoading = $state(true);

	// v1 flags: the daily is finished (button becomes practice) / practice result was closed
	showPractice = $state(false);
	showPlayAgain = $state(false);

	// which dialog is open (stats, settings, help or the practice result)
	dialog = $state<DialogName>(null);

	// bumped whenever a daily result is saved, so the stats dialog re-reads localStorage
	resultsVersion = $state(0);

	// Deriving game status dynamically (rules live in engine/rules.ts)
	status: GameEvaluation = $derived(
		evaluateGame(this.start, this.target, this.guessedStates, this.graph)
	);

	// the daily is finished and we're not in practice: the main button offers practice
	hasPlayedToday = $derived(this.showPractice && !this.practiceMode);

	private resultShownDaily = false;
	private resultShownPractice = false;

	// the result dialog opens shortly after the last guess. if a new puzzle starts first (e.g. the
	// player taps practice right away) the pending result is cancelled, so a practice result never
	// pops up for a practice game that hasn't been played
	private resultTimer: ReturnType<typeof setTimeout> | null = null;

	// Function to cancel a result dialog that hasn't opened yet
	private cancelPendingResult() {
		if (this.resultTimer) clearTimeout(this.resultTimer);
		this.resultTimer = null;
	}

	// Function to start the game when the page loads
	async init() {
		ensureStorageVersion(); // marks journyStorageVersion, never rewrites v1 data

		const started = Date.now();
		await this.loadDailyChallengeAndProgress();

		const remaining = FIRST_LOAD_DELAY - (Date.now() - started);
		setTimeout(() => (this.isLoading = false), Math.max(0, remaining));
	}

	// Load today's challenge (v1 json before SWITCH_DATE, generated from the date after)
	async setDailyChallenge() {
		const today = getTodayKey(); // YYYY-MM-DD format

		if (this.daily?.dateKey === today) return; // avoid refetching

		try {
			let todayChallenge: DailyPuzzle | null;

			if (isLegacyDate(today)) {
				const res = await fetch('/validChallenges.json');
				todayChallenge = getLegacyPuzzle(today, await res.json());
			} else {
				todayChallenge = getGeneratedPuzzle(today);
			}

			if (todayChallenge) {
				this.daily = todayChallenge;
			} else {
				console.error(`No challenge found for ${today}`);
			}
		} catch (error) {
			console.error('Failed to load the daily challenge:', error);
		}
	}

	// Function to show today's daily with any saved progress
	async loadDailyChallengeAndProgress() {
		this.cancelPendingResult();
		await this.setDailyChallenge();
		if (!this.daily) return;

		this.practiceMode = false;
		this.showPlayAgain = false;
		this.start = this.daily.start;
		this.target = this.daily.target;
		this.graph = this.daily.graph;
		this.restoreDailyProgress();
	}

	// Function to restore today's guesses (and clean up older days, as v1 did)
	restoreDailyProgress() {
		const todayProgress = loadDailyProgress(this.daily!.dateKey);

		this.guessedStates = todayProgress?.guessedStates ?? [];

		// the result modal was already shown for today's daily, don't replay it
		this.resultShownDaily = !!todayProgress?.resultSeen;

		// only a *finished* daily counts as played today (v1 bug 9)
		this.showPractice = isGameOver(this.status.status);

		// a finished daily whose result was never shown (e.g. finished in v1) shows it once
		if (this.showPractice && !this.resultShownDaily) this.onGameOver();
	}

	// Generate new practice mode states (always a new puzzle, never the daily: v1 bug 2)
	setPracticeMode() {
		this.cancelPendingResult();
		const { start, target } = getRandomStatePair();

		this.practiceMode = true;
		this.showPlayAgain = false;
		this.graph = statesGraph;
		this.start = start;
		this.target = target;
		this.guessedStates = [];
		this.resultShownPractice = false;
	}

	// Function to switch between the daily challenge and practice (settings switch)
	async setMode(practice: boolean) {
		if (practice) {
			this.setPracticeMode();
		} else {
			await this.loadDailyChallengeAndProgress();
		}
	}

	// Function for the main button: guess, start practice after the daily, or play again
	async mainAction(input: string): Promise<GuessCheck | null> {
		if (this.showPlayAgain && this.practiceMode) {
			this.setPracticeMode();
			return null;
		}
		if (this.hasPlayedToday) {
			this.setPracticeMode();
			return null;
		}
		return this.submitGuess(input);
	}

	// Submit Guess with Validation (the engine decides if a guess is allowed)
	submitGuess(input: string): GuessCheck {
		const check = checkGuess(input, {
			start: this.start,
			target: this.target,
			guessed: this.guessedStates,
			status: this.status.status,
			graph: this.graph
		});

		if (!check.ok) return check;

		this.guessedStates = [...this.guessedStates, check.state];
		this.saveDailyProgress();

		if (isGameOver(this.status.status)) this.onGameOver();

		return check;
	}

	// Function to save today's daily progress (practice is never saved)
	saveDailyProgress() {
		if (this.practiceMode || !this.daily) return;

		saveDailyProgress(this.daily.dateKey, {
			guessedStates: this.guessedStates,
			guessCount: this.guessedStates.length,
			won: isWin(this.status.status)
		});
	}

	// Function to record a finished daily in the stats history
	recordDailyResult() {
		if (!this.daily) return;

		recordDailyResult(this.daily.dateKey, {
			won: isWin(this.status.status),
			guessCount: this.guessedStates.length,
			shortestPathLength: this.status.optimalGuesses,
			isDaily: true
		});
		this.resultsVersion++;
	}

	// Function to handle the end of a game: save, celebrate, show the result
	onGameOver() {
		if (this.practiceMode) {
			if (this.resultShownPractice) return;
			this.resultShownPractice = true;
		} else {
			this.recordDailyResult();
			this.showPractice = true; // the button becomes practice (even if the modal is closed)
			if (this.resultShownDaily) return;
			this.resultShownDaily = true;
		}

		if (isWin(this.status.status)) celebrate();

		// decide which result to show now, not when the timer fires
		const resultDialog: DialogName = this.practiceMode ? 'practice-result' : 'stats';
		const dailyDate = this.daily?.dateKey;
		this.cancelPendingResult();
		this.resultTimer = setTimeout(() => {
			this.resultTimer = null;
			this.dialog = resultDialog;
			// only a result that was really shown counts as seen (no replay after a reload)
			if (resultDialog === 'stats' && dailyDate) markDailyResultSeen(dailyDate);
		}, RESULT_DELAY);
	}

	// Function to close the open dialog (closing the practice result offers "play again")
	closeDialog() {
		if (this.dialog === 'practice-result') this.showPlayAgain = true;
		this.dialog = null;
	}
}

export const game = new JournyGame();
