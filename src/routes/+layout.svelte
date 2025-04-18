<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	import {
		AppShell,
		AppBar,
		Modal,
		modeOsPrefers,
		modeCurrent,
		modeUserPrefers
	} from '@skeletonlabs/skeleton';
	import { getModalStore, initializeStores, LightSwitch } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { Toast } from '@skeletonlabs/skeleton';
	import { autoModeWatcher } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { ChartBar, Map2, Settings } from 'tabler-icons-svelte';
	import { QuestionMark } from 'tabler-icons-svelte';
	import Footer from '$lib/components/Footer.svelte';
	import HelpModal from '$lib/components/HelpModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import DailyChallengeModal from '$lib/components/DailyChallengeModal.svelte';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	injectSpeedInsights();

	// read docs on getting user os preference for theme, too lazy right now

	onMount(() => {
		autoModeWatcher();

		modeOsPrefers.subscribe((value) => {
			// console.log('modeOsPrefers', value);
		});

		modeUserPrefers.subscribe((value) => {
			// console.log('modeUserPrefers', value);
		});

		modeCurrent.subscribe((value) => {
			// console.log('modeCurrent', value);
		});
	});

	initializeStores();

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	const modalStore = getModalStore();
	// const toastStore = getToastStore();

	function helpModalToggle() {
		const modal: ModalSettings = {
			type: 'component',
			component: {
				ref: HelpModal
			}
		};
		modalStore.trigger(modal);
	}

	function settingModalToggle() {
		const modal: ModalSettings = {
			type: 'component',
			component: {
				ref: SettingsModal
			}
		};
		modalStore.trigger(modal);
	}

	function dailyChallengeModalToggle() {
		const modal: ModalSettings = {
			type: 'component',
			component: {
				ref: DailyChallengeModal
			}
		};
		modalStore.trigger(modal);
	}
</script>

<link
	rel="preload"
	href="https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap"
	as="style"
/>
<link
	rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap"
/>

<!-- <svelte:head>{@html '<script>(' + autoModeWatcher.toString() + ')();</script>'}</svelte:head> -->

<svelte:head>
	<title>journy.us</title>
	<link rel="icon" href="/map-icon.png" />
	<!-- <link rel="icon" type="image/png" href="/map-emoji?v=2.png" />
	<link rel="icon" type="image/x-icon" href="/map-emoji?v=2.png" /> -->
	<!-- <link rel="apple-touch-icon" href="/apple-touch-icon.png" /> -->

	<!-- Open Graph Meta Tags (for Facebook, LinkedIn) -->
	<meta property="og:title" content="journy.us" />
	<meta property="og:description" content="journy.us" />
	<meta property="og:url" content="https://www.journy.us/" />
	<meta property="og:image" content="https://www.journy.us/map-icon.png" />
	<meta property="og:type" content="website" />

	<!-- Twitter Card Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="journy.us" />
	<meta name="twitter:description" content="journy.us" />
	<meta name="twitter:image" content="https://www.journy.us/map-icon.png" />

	<!-- Viewport -->
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<Modal />

<Toast position="t" />

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<!-- Map Icon & Title -->
				<div class="flex items-center space-x-2">
					<Map2 />
					<strong class="journy-title">journy</strong>
				</div>
			</svelte:fragment>

			<svelte:fragment slot="trail">
				<!-- Beta Chip -->
				<span class="chip chip-text border border-current px-2 py-1 rounded-full bg-transparent"
					>beta</span
				>

				<!-- Daily Challenge Button -->
				<button
					class="btn-icon btn-sm variant-ghost-surface flex items-center justify-center w-10 h-10 p-2 bg-transparent"
					on:click={dailyChallengeModalToggle}
				>
					<ChartBar class="w-4 h-4" />
				</button>

				<!-- Settings Button -->
				<button
					class="btn-icon btn-sm variant-ghost-surface flex items-center justify-center w-10 h-10 p-2 bg-transparent"
					on:click={settingModalToggle}
				>
					<Settings class="w-4 h-4" />
				</button>

				<!-- Help Button -->
				<button
					class="btn-icon btn-sm variant-ghost-surface flex items-center justify-center w-10 h-10 p-2 bg-transparent"
					on:click={helpModalToggle}
				>
					<QuestionMark class="w-4 h-4" />
				</button>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<!-- Page Content -->
	<slot />

	<!-- Footer -->
	<Footer />
</AppShell>

<!-- Import Google Font -->
<style>
	@import url('https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap');

	.journy-title {
		font-family: 'Gloria Hallelujah', cursive;
		font-size: 1.5rem;
		font-weight: bold;
	}

	.chip-text {
		font-family: 'Gloria Hallelujah', cursive;
		font-size: 0.9rem;
		font-weight: bold;
	}
</style>
