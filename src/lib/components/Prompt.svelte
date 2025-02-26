<script>
	import { onMount } from 'svelte';
	import { startState, targetState, pathLength, statesLoaded, isLoading } from '../stores';
	import { statesGraph } from '$lib/statesGraph';
	import { findShortestPath, checkLoadingComplete } from '$lib/utils';

	const states = Object.keys(statesGraph);

	// console.log('states', states);

	function getRandomStatePair() {
		let start, target, shortestPath;

		do {
			start = states[Math.floor(Math.random() * states.length)];
			target = states[Math.floor(Math.random() * states.length)];
			shortestPath = findShortestPath(start, target);

			// !shortestPath is null case
			// choose a state that is at least 3 away and 6 at most
			// >7 or <4 ensures avoids adjacent picks
		} while (!shortestPath || shortestPath.length > 7 || shortestPath.length < 4);

		console.log('shortestPath length (includes start, target):', shortestPath.length);
		console.log('shortestPath length (excludes start, target):', shortestPath.length - 2);

		// return object literal
		return { start, target, length: shortestPath.length - 2 }; // subtract 1 to exclude start state. don't need 2? verify later
	}

	onMount(() => {
		const { start, target, length } = getRandomStatePair();
		startState.set(start);
		targetState.set(target);
		pathLength.set(length);

		// Mark state selection as loaded
		statesLoaded.set(true);
		checkLoadingComplete(); // Check if map is also ready
	});

	// console.log('startState', startState);
	// console.log('targetState', targetState);
</script>

<div class="flex flex-col items-center space-y-4 p-2">
	{#if $isLoading}
		<h3 class="h4 animate-pulse">finding your journy...</h3>
	{:else}
		<h3 class="h4">
			to go from <span class="font-semibold text-primary-600">{$startState}</span> to
			<span class="font-semibold text-secondary-600">{$targetState}</span>
		</h3>
	{/if}
</div>
