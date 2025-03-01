<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, Modal } from '@skeletonlabs/skeleton';
	import { getModalStore, initializeStores, LightSwitch } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';

	import { storePopup } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

	import { Toast, getToastStore } from '@skeletonlabs/skeleton';
	// import type { ToastSettings, ToastStore } from '@skeletonlabs/skeleton';

	import { Map2 } from 'tabler-icons-svelte';
	import { QuestionMark } from 'tabler-icons-svelte';
	import Footer from '$lib/components/Footer.svelte';
	import HelpModalContent from '$lib/components/HelpModalContent.svelte';

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

	// function helpModalToggle() {
	// 	const modal: ModalSettings = {
	// 		type: 'alert',
	// 		title: '📖 How to Play Journy',
	// 		// component: {
	// 		// 	ref: HelpModal, // Attach the HelpModalContent component
	// 		// },
	// 		body: 'This is an example modal with game instructions.',
	// 		image: 'https://i.imgur.com/WOgTG96.gif'
	// 	};
	// 	modalStore.trigger(modal);
	// 	// console.log('modal clicked');
	// }
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
