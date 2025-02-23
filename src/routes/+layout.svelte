<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, Modal } from '@skeletonlabs/skeleton';
	import { getModalStore, initializeStores, LightSwitch } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { Map2 } from 'tabler-icons-svelte';
	import { QuestionMark } from 'tabler-icons-svelte';

	initializeStores();
	const modalStore = getModalStore();

	function modalToggle() {
		const modal: ModalSettings = {
			type: 'alert',
			title: 'Help & Instructions',
			body: 'This is an example modal with game instructions.',
			image: 'https://i.imgur.com/WOgTG96.gif'
		};
		modalStore.trigger(modal);
		console.log('modal clicked');
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

<Modal />

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
				<!-- Dark/Light Mode Toggle -->
				<LightSwitch />

				<!-- Help Button -->
				<button
					class="btn btn-sm variant-ghost-surface flex items-center justify-center w-10 h-10 p-2"
					on:click={modalToggle}
				>
					<QuestionMark class="w-5 h-5" />
				</button>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<!-- Page Content -->
	<slot />
</AppShell>

<!-- Import Google Font -->
<style>
	@import url('https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap');

	.journy-title {
		font-family: 'Gloria Hallelujah', cursive;
		font-size: 1.5rem;
		font-weight: bold;
	}
</style>
