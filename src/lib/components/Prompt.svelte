<script>
	import { onMount } from 'svelte';
	import { startState, targetState, pathLength, statesLoaded, isLoading } from '../stores';
	import { checkLoadingComplete, getRandomStatePair } from '$lib/utils';

	// console.log('states', states);

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
