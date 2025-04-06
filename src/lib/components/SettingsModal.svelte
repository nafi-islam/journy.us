<script lang="ts">
	import { getModalStore, LightSwitch, SlideToggle } from '@skeletonlabs/skeleton';
	import { practiceMode } from '../stores';

	const modalStore = getModalStore();

	// function togglePracticeMode() {
	// 	practiceMode.update((value) => !value);
	// }

	//$: console.log('practiceMode: ', $practiceMode);
</script>

<!-- Settings Modal Content -->
<div class="modal-container p-6 rounded-xl shadow-lg bg-surface-100 dark:bg-surface-800">
	<div class="font-bold text-2xl">⚙️ Settings</div>

	<!-- Game Mode Modifier -->
	<div class="flex flex-col gap-2 text-lg space-y-4 p-4">
		<strong>Game Mode</strong>
		<!-- Wrap in a div to move it to the next line -->
		<div>
			<SlideToggle
				class="transition duration-200"
				name="slide"
				bind:checked={$practiceMode}
				label={$practiceMode ? 'Practice' : 'Daily Challenge'}
				active="bg-primary-500"
				size="sm"
			>
				{$practiceMode ? 'Practice' : 'Daily Challenge'}
			</SlideToggle>
		</div>
		<strong>Color Mode</strong>
		<!-- Dark/Light Mode Toggle -->
		<div>
			<LightSwitch
				class="transition duration-200"
				bgLight="bg-[#FBE7D1]"
				bgDark="bg-[#73420D]"
				rounded="rounded-full"
			/>
		</div>
	</div>

	<!-- Button Section -->
	<div class="modal-footer">
		<button class="btn variant-ghost-surface" on:click={() => modalStore.close()}>Close</button>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap');

	.modal-container {
		max-width: 600px;
		margin: auto;
		position: relative;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		padding-top: 1rem;
	}
</style>
