<script lang="ts">
	import { onMount } from 'svelte';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { geoAlbersUsa, geoPath } from 'd3-geo';
	import { json } from 'd3-fetch';
	import { feature } from 'topojson-client';
	import type { FeatureCollection, Feature, Geometry } from 'geojson';
	import {
		startState,
		targetState,
		guessedStates,
		mapLoaded,
		isLoading,
		practiceMode
	} from '../stores';
	import { checkLoadingComplete } from '$lib/utils';

	const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

	type StateFeature = Feature<Geometry, { name: string }>;
	type StateCollection = FeatureCollection<Geometry, { name: string }>;

	let states: StateFeature[] = [];
	// let guessedStates: string[] = [];

	// let forceLoading = true;

	// Store Subscription
	let start: string;
	let target: string;

	let guessed: string[] = [];
	// guessedStates.subscribe((value) => (guessed = value));

	$: guessed = $guessedStates;

	startState.subscribe((value) => (start = value));
	targetState.subscribe((value) => (target = value));

	// Define projection & path
	const projection = geoAlbersUsa().scale(1250).translate([480, 300]);
	const pathGenerator = geoPath(projection);

	// Fetch the map data when component mounts
	onMount(async () => {
		try {
			const data = (await json(geoUrl)) as any;
			const stateCollection = feature(data, data.objects.states) as unknown as StateCollection;
			states = stateCollection.features;
		} catch (error) {
			console.error('Error loading map data:', error);
		} finally {
			// Mark the map as loaded
			mapLoaded.set(true);
			checkLoadingComplete(); // Check if prompt is also ready
		}
	});

	// Set state colors, use Skeleton Vintage Color Palette
	$: getFillColor = (stateName: string): string => {
		const style = getComputedStyle(document.documentElement);

		if (stateName === start)
			return `rgb(${style.getPropertyValue('--color-primary-500').trim() || '234, 134, 26'})`;
		if (stateName === target)
			return `rgb(${style.getPropertyValue('--color-secondary-500').trim() || '151, 206, 165'})`;
		if (guessed.includes(stateName))
			return `rgb(${style.getPropertyValue('--color-tertiary-500').trim() || '6, 182, 212'})`;
		return `rgb(${style.getPropertyValue('--color-surface-300').trim() || '129, 124, 119'})`;
	};

	// $: console.log('Updated guessed states:', $guessedStates);
	// $: console.log('Guessed states updated in store:', $guessedStates);
</script>

<!-- Render the map -->
<div class="map-container">
	<div class="map-glow"></div>
	{#if $isLoading}
		<div class="map-loader">
			<ProgressRadial value={undefined} class="text-primary-500" meter="stroke-primary-500" />
		</div>
	{:else}
		<svg width="550" height="350" viewBox="0 0 960 600">
			<g>
				{#each states as state}
					{#if $practiceMode || state.properties.name === $startState || state.properties.name === $targetState || guessed.includes(state.properties.name)}
						<path
							d={pathGenerator(state)}
							fill={getFillColor(state.properties.name)}
							stroke="#FFF"
							class="transition duration-200 ease-in-out hover:stroke-2 hover:stroke-black"
						/>
					{/if}
				{/each}
			</g>
		</svg>
	{/if}
</div>

<style lang="postcss">
	.map-container {
		width: 100%;
		max-width: 550px; /* Keep desktop size */
		height: auto;
		aspect-ratio: 16 / 10; /* Maintains aspect ratio */
	}

	svg {
		width: 100%;
		height: auto;
	}

	.map-loader {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
	}

	.map-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 300px; /* Adjust size */
		height: 300px;
		border-radius: 50%;
		filter: blur(50px);
		z-index: -1;
		opacity: 0.6;
		animation:
			pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite,
			glow 5s linear infinite;
	}

	/* Glow color transitions */
	@keyframes glow {
		0% {
			background-color: rgba(234, 134, 26, 0.5); /* Primary */
		}
		33% {
			background-color: rgba(151, 206, 165, 0.5); /* Secondary */
		}
		66% {
			background-color: rgba(6, 182, 212, 0.5); /* Tertiary */
		}
		100% {
			background-color: rgba(234, 134, 26, 0.5);
		}
	}

	/* Pulse effect */
	@keyframes pulse {
		50% {
			transform: translate(-50%, -50%) scale(1.5);
		}
	}

	@media (max-width: 600px) {
		.map-container {
			display: flex;
			justify-content: center;
			align-items: center;
			min-height: 250px; /* Ensures enough space for loader */
		}

		.map-loader {
			position: static; /* Prevents absolute positioning */
			width: 100%;
			height: 100%;
		}
	}
</style>
