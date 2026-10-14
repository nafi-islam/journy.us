<script lang="ts">
	// the us map. the daily only draws the start, target and guessed states (fog of war);
	// practice draws every state so players can learn the map
	import { MAP_HEIGHT, MAP_WIDTH, mapStates } from '#lib/map/mapData.ts';
	import { game } from '#lib/game.svelte.ts';

	// Function to decide if a state is drawn
	function isVisible(name: string): boolean {
		return (
			game.practiceMode ||
			name === game.start ||
			name === game.target ||
			game.guessedStates.includes(name)
		);
	}

	// Function to pick a state's color (skeleton vintage palette, same as v1)
	// note: skeleton's light / dark color pairs only exist when the two shades add up to 1000
	// (e.g. surface-300-700). a pair like surface-300-600 silently does nothing (and the state
	// turns black), so the unplayed gray uses an explicit dark: variant instead
	function fillClass(name: string): string {
		if (name === game.start) return 'fill-primary-500';
		if (name === game.target) return 'fill-secondary-500';
		if (game.guessedStates.includes(name)) return 'fill-tertiary-500';
		return 'fill-surface-300 dark:fill-surface-400';
	}

	const visibleStates = $derived(mapStates.filter((state) => isVisible(state.name)));

	// the daily reveals states with a small pop (practice shows the whole map at once)
	const popClass = $derived(game.practiceMode ? '' : 'animate-pop-in');
</script>

<!-- Render the map -->
<div
	class="relative flex aspect-[8/5] w-full max-w-xl items-center justify-center overflow-hidden rounded-container border border-surface-200-800/60 bg-surface-100-900/40 shadow-inner"
>
	{#if game.isLoading}
		<!-- loading spinner -->
		<div
			class="size-12 animate-spin rounded-full border-4 border-surface-300-700 border-t-primary-500 motion-reduce:animate-none"
			role="status"
			aria-label="loading the map"
		></div>
	{:else}
		<svg
			data-testid="map"
			class="h-full w-full p-2"
			viewBox="0 0 {MAP_WIDTH} {MAP_HEIGHT}"
			role="img"
			aria-label="map of the united states"
		>
			<!-- fills first, then every border on top: drawing each state's border with its own
			     fill let the next state cover half of the shared line, so outlines looked broken -->
			<g data-testid="map-fills">
				{#each visibleStates as state (state.name)}
					<path
						d={state.path}
						class="{fillClass(
							state.name
						)} {popClass} transition-[fill,opacity] duration-300 hover:opacity-85"
						style="transform-origin: {state.centroid[0]}px {state.centroid[1]}px"
					>
						<title>{state.name}</title>
					</path>
				{/each}
			</g>
			<g
				data-testid="map-borders"
				class="pointer-events-none fill-none stroke-surface-50 dark:stroke-surface-950"
				stroke-width="1.2"
				stroke-linejoin="round"
			>
				{#each visibleStates as state (state.name)}
					<path
						d={state.path}
						class={popClass}
						style="transform-origin: {state.centroid[0]}px {state.centroid[1]}px"
					/>
				{/each}
			</g>
		</svg>
	{/if}
</div>
