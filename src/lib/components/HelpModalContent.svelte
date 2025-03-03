<script lang="ts">
	import { Accordion, AccordionItem, getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();
</script>

<!-- Help Modal Content -->
<div class="modal-container p-6 rounded-xl shadow-lg bg-surface-100 dark:bg-surface-800">
	<div class="font-bold text-2xl">🗺️ Welcome to Journy!</div>

	<!-- Game Instructions -->
	<div class="text-lg space-y-4 p-4">
		<strong>How to Play</strong>
		<p>
			Start at the randomly chosen <span class="text-primary-500 font-semibold">start state</span>
			and guess neighboring states to reach the
			<span class="text-secondary-600 font-semibold">target state</span>.
		</p>
		<p>You have a limited number of guesses – use them wisely!</p>
	</div>

	<!-- Accordion for Credits & Feedback -->
	<Accordion class="card p-4 text-token shadow-md bg-surface-100 dark:bg-surface-800">
		<!-- Credits Section -->
		<AccordionItem open>
			<svelte:fragment slot="summary">
				<p class="font-bold">🎭 Credits</p>
			</svelte:fragment>
			<svelte:fragment slot="content">
				<span class="flex items-center gap-1 text-sm text-surface-700 dark:text-surface-300">
					Developed by
					<a
						href="https://nafiislam.com"
						target="_blank"
						rel="noopener noreferrer"
						class="journy-text text-transparent bg-clip-text box-decoration-clone bg-gradient-to-br
							from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 transition duration-200 outlined-text"
					>
						NAFI
					</a>
				</span>
				<p class="text-sm text-surface-700 dark:text-surface-300">
					Journy was developed using Svelte and Skeleton UI for the user interface and overall
					design, d3.js for map rendering, and Vite for the build tool.
				</p>
				<p class="text-sm text-surface-700 dark:text-surface-300">
					You can contribute on GitHub, <a
						href="https://github.com/nafi-islam/journy.us"
						target="_blank"
						rel="noopener noreferrer"
						class="underline hover:text-primary-500 dark:hover:text-primary-500">here!</a
					>
				</p>
			</svelte:fragment>
		</AccordionItem>

		<!-- Feedback Section -->
		<AccordionItem>
			<svelte:fragment slot="summary">
				<p class="font-bold">✉️ Feedback</p>
			</svelte:fragment>
			<svelte:fragment slot="content">
				<p class="text-sm text-surface-700 dark:text-surface-300">
					Have suggestions or found a bug? Let me know by sending an <a
						href="mailto:nafi.islam321@gmail.com"
						target="_blank"
						rel="noopener noreferrer"
						class="underline hover:text-primary-500 dark:hover:text-primary-500">email!</a
					>
				</p>
			</svelte:fragment>
		</AccordionItem>
	</Accordion>

	<!-- Button Section -->
	<div class="modal-footer">
		<button class="btn variant-ghost-surface" on:click={() => modalStore.close()}>Close</button>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap');

	.journy-text {
		font-family: 'Gloria Hallelujah', cursive;
		font-size: 1rem;
		font-weight: bold;
	}

	.outlined-text {
		filter: drop-shadow(0.5px 0.5px 0 black) drop-shadow(-0.5px -0.5px 0 black);
	}

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
