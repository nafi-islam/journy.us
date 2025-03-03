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
	import { Map2 } from 'tabler-icons-svelte';
	import { QuestionMark } from 'tabler-icons-svelte';
	import Footer from '$lib/components/Footer.svelte';
	import HelpModalContent from '$lib/components/HelpModalContent.svelte';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

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
				ref: HelpModalContent
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

				<!-- Dark/Light Mode Toggle -->
				<LightSwitch
					class="transition duration-200"
					bgLight="bg-[#FBE7D1]"
					bgDark="bg-[#73420D]"
					rounded="rounded-full"
				/>

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
