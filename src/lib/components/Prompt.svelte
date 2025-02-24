<script>
	import { onMount } from 'svelte';
	import { startState, targetState } from '../stores';
	import { statesGraph } from '$lib/statesGraph';

	const states = Object.keys(statesGraph);

	// console.log('states', states);

	onMount(() => {
		startState.set(states[Math.floor(Math.random() * states.length)]);
		targetState.set(states[Math.floor(Math.random() * states.length)]);
	});

	// console.log('startState', startState);
	// console.log('targetState', targetState);
</script>

<div class="flex flex-col items-center space-y-4 p-2">
	<h3 class="h4">
		to go from <span class="font-semibold text-primary-600">{$startState}</span> to
		<span class="font-semibold text-secondary-600">{$targetState}</span>
	</h3>
</div>
