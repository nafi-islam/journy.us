<script lang="ts">
	// settings: game mode (daily / practice) and color mode (light / dark)
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import IconSettings from '@tabler/icons-svelte-runes/icons/settings';
	import IconSun from '@tabler/icons-svelte-runes/icons/sun';
	import IconMoon from '@tabler/icons-svelte-runes/icons/moon';
	import Modal from './Modal.svelte';
	import { game } from '#lib/game.svelte.ts';
	import { isLightMode, setLightMode } from '#lib/theme.ts';

	let lightMode = $state(false);

	// read the current mode whenever the settings open
	$effect(() => {
		if (game.dialog === 'settings') lightMode = isLightMode();
	});
</script>

<Modal name="settings" title="Settings">
	{#snippet icon()}
		<IconSettings class="size-6 text-primary-500" />
	{/snippet}

	<div class="space-y-6 py-2">
		<!-- Game Mode Modifier -->
		<div class="space-y-2">
			<h3 class="font-semibold">Game Mode</h3>
			<Switch
				checked={game.practiceMode}
				onCheckedChange={(details) => {
					game.setMode(details.checked);
					// close settings so the new puzzle is visible (the dialog covers the map on phones)
					setTimeout(() => game.closeDialog(), 250);
				}}
				data-testid="game-mode-switch"
			>
				<Switch.Control class="data-[state=checked]:preset-filled-primary-500">
					<Switch.Thumb />
				</Switch.Control>
				<Switch.Label>{game.practiceMode ? 'Practice' : 'Daily Challenge'}</Switch.Label>
				<Switch.HiddenInput />
			</Switch>
		</div>

		<!-- Dark/Light Mode Toggle -->
		<div class="space-y-2">
			<h3 class="font-semibold">Color Mode</h3>
			<Switch
				checked={lightMode}
				onCheckedChange={(details) => {
					lightMode = details.checked;
					setLightMode(details.checked);
				}}
				data-testid="color-mode-switch"
			>
				<Switch.Control class="data-[state=checked]:preset-filled-primary-500">
					<Switch.Thumb>
						{#if lightMode}
							<IconSun class="size-3" />
						{:else}
							<IconMoon class="size-3" />
						{/if}
					</Switch.Thumb>
				</Switch.Control>
				<Switch.Label>{lightMode ? 'Light' : 'Dark'}</Switch.Label>
				<Switch.HiddenInput />
			</Switch>
		</div>
	</div>
</Modal>
