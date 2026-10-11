<script lang="ts">
	import '../app.css';
	import { onMount, type Component, type Snippet } from 'svelte';
	import { Toast } from '@skeletonlabs/skeleton-svelte';
	import IconChartBar from '@tabler/icons-svelte-runes/icons/chart-bar';
	import IconSettings from '@tabler/icons-svelte-runes/icons/settings';
	import IconQuestionMark from '@tabler/icons-svelte-runes/icons/question-mark';
	import IconMap2 from '@tabler/icons-svelte-runes/icons/map-2';
	import Footer from '#lib/components/Footer.svelte';
	import { game, type DialogName } from '#lib/game.svelte.ts';
	import { toaster } from '#lib/toaster.ts';

	let { children }: { children: Snippet } = $props();

	// the modals are loaded lazily: right after the first paint, or as soon as one is opened
	let Modals: Component | null = $state(null);

	// Function to load the modals (once)
	async function loadModals() {
		if (!Modals) Modals = (await import('#lib/components/Modals.svelte')).default;
	}

	onMount(() => {
		const idle =
			window.requestIdleCallback ?? ((callback: () => void) => setTimeout(callback, 200));
		idle(() => loadModals());
	});

	$effect(() => {
		if (game.dialog) loadModals();
	});

	const headerButtons: { dialog: DialogName; label: string; icon: typeof IconChartBar }[] = [
		{ dialog: 'stats', label: 'statistics', icon: IconChartBar },
		{ dialog: 'settings', label: 'settings', icon: IconSettings },
		{ dialog: 'help', label: 'how to play', icon: IconQuestionMark }
	];
</script>

<svelte:head>
	<title>journy.us</title>
	<meta
		name="description"
		content="a daily us geography game: connect two states in as few guesses as possible"
	/>

	<!-- Open Graph Meta Tags (for Facebook, LinkedIn) -->
	<meta property="og:title" content="journy.us" />
	<meta
		property="og:description"
		content="a daily us geography game: connect two states in as few guesses as possible"
	/>
	<meta property="og:url" content="https://www.journy.us/" />
	<meta property="og:image" content="https://www.journy.us/map-icon.png" />
	<meta property="og:type" content="website" />

	<!-- Twitter Card Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="journy.us" />
	<meta
		name="twitter:description"
		content="a daily us geography game: connect two states in as few guesses as possible"
	/>
	<meta name="twitter:image" content="https://www.journy.us/map-icon.png" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<!-- App Bar -->
	<header
		id="app-header"
		class="sticky top-0 z-40 border-b border-surface-200-800/60 bg-surface-50-950/80 backdrop-blur"
	>
		<div class="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">
			<!-- Map Icon & Title -->
			<div class="flex items-center gap-2">
				<IconMap2 class="size-6 text-primary-500" />
				<strong class="font-hand text-2xl">journy</strong>
			</div>

			<div class="flex items-center gap-1">
				<!-- Beta Chip -->
				<span class="mr-1 chip rounded-full border border-current px-2 py-0.5 font-hand text-sm">
					beta
				</span>

				<!-- Stats / Settings / Help Buttons -->
				{#each headerButtons as button (button.dialog)}
					<button
						type="button"
						class="btn-icon hover:preset-tonal"
						aria-label={button.label}
						title={button.label}
						onclick={() => (game.dialog = button.dialog)}
					>
						<button.icon class="size-5" />
					</button>
				{/each}
			</div>
		</div>
	</header>

	<!-- Page Content -->
	<main class="mx-auto w-full max-w-2xl flex-1 px-4">
		{@render children()}
	</main>

	<!-- Footer -->
	<Footer />
</div>

<!-- Modals -->
{#if Modals}
	<Modals />
{/if}

<!-- Toasts -->
<Toast.Group {toaster}>
	{#snippet children(toast)}
		<Toast {toast} class="preset-filled-error-500">
			<Toast.Message>
				<Toast.Title>{toast.title}</Toast.Title>
			</Toast.Message>
			<Toast.CloseTrigger />
		</Toast>
	{/snippet}
</Toast.Group>
