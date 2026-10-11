<script lang="ts">
	// how to play, guess guide, credits, feedback and patch notes
	import { Accordion } from '@skeletonlabs/skeleton-svelte';
	import { slide } from 'svelte/transition';
	import IconChevronDown from '@tabler/icons-svelte-runes/icons/chevron-down';
	import Modal from './Modal.svelte';

	const patchNotes = [
		{
			date: 'v2',
			description:
				'a fresh coat of paint, endless daily challenges, local-midnight dailies, faster loading, and bug fixes (streaks, sharing after practice and more)'
		},
		{
			date: 'april 7th, 2025',
			description: 'added a daily challenge mode, user stats, guess guide, and share feature'
		},
		{
			date: 'march 3rd, 2025',
			description: 'initial public release of journy 🎉'
		}
	];

	const sections = ['guide', 'credits', 'feedback', 'patch-notes'] as const;
	const titles: Record<(typeof sections)[number], string> = {
		guide: '🏆 Guess Guide',
		credits: '🎭 Credits',
		feedback: '✉️ Feedback',
		'patch-notes': '📦 Patch Notes'
	};
</script>

<Modal name="help" title="🗺️ Welcome to Journy!">
	<!-- Game Instructions -->
	<div class="space-y-3">
		<h3 class="font-semibold">How to Play</h3>
		<p>
			Start at the randomly chosen <span class="font-semibold text-primary-500">start state</span>
			and guess neighboring states to reach the
			<span class="font-semibold text-secondary-600-400">target state</span>.
		</p>
		<p>You have a limited number of guesses – use them wisely!</p>
		<p class="text-sm opacity-70">
			States are neighbors when they share a border line. Corners don't count (the four corners only
			touch at a point).
		</p>
	</div>

	<!-- Accordion for Guess Guide, Credits, Feedback & Patch Notes -->
	<Accordion defaultValue={['guide']} multiple class="card bg-surface-100-900 p-2">
		{#each sections as section, i (section)}
			{#if i !== 0}
				<hr class="hr" />
			{/if}
			<Accordion.Item value={section}>
				<Accordion.ItemTrigger class="flex items-center justify-between gap-2 font-bold">
					{titles[section]}
					<Accordion.ItemIndicator class="group">
						<IconChevronDown class="size-5 transition group-data-[state=open]:rotate-180" />
					</Accordion.ItemIndicator>
				</Accordion.ItemTrigger>
				<Accordion.ItemContent>
					{#snippet element(attributes)}
						{#if !attributes.hidden}
							<div {...attributes} transition:slide={{ duration: 150 }} class="space-y-2 text-sm">
								{#if section === 'guide'}
									<ul class="space-y-2">
										<li>🟩 This state is part of a possible shortest path from start to target.</li>
										<li>🟧 This state is connected to a state on a possible shortest path.</li>
										<li>🟥 This state is not connected and is out of the way.</li>
									</ul>
								{:else if section === 'credits'}
									<p>
										Developed by
										<a
											href="https://nafiislam.com"
											target="_blank"
											rel="noopener noreferrer"
											class="bg-gradient-to-br from-red-500 to-yellow-500 bg-clip-text font-hand font-bold text-transparent"
										>
											NAFI
										</a>
									</p>
									<p>
										Journy is built with Svelte, SvelteKit and Skeleton for the user interface and
										overall design, and d3.js to prepare the map.
									</p>
									<p>
										You can contribute on GitHub,
										<a
											href="https://github.com/nafi-islam/journy.us"
											target="_blank"
											rel="noopener noreferrer"
											class="anchor underline">here!</a
										>
									</p>
								{:else if section === 'feedback'}
									<p>
										Have suggestions or found a bug? Let me know by sending an
										<a
											href="mailto:nafi.islam321@gmail.com"
											target="_blank"
											rel="noopener noreferrer"
											class="anchor underline">email!</a
										>
									</p>
								{:else}
									<ul class="list-disc space-y-1 pl-5">
										{#each patchNotes as note (note.date)}
											<li><strong>{note.date}</strong> – {note.description}</li>
										{/each}
									</ul>
								{/if}
							</div>
						{/if}
					{/snippet}
				</Accordion.ItemContent>
			</Accordion.Item>
		{/each}
	</Accordion>
</Modal>
