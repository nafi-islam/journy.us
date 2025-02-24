<script lang="ts">
	import { gameStatus } from '../utils';
</script>

{#if $gameStatus.status !== 'waiting'}
	<div
		class="game-status p-4 rounded-md text-center"
		class:green-500={$gameStatus.status === 'win'}
		class:yellow-500={$gameStatus.status === 'sub-win'}
		class:red-500={$gameStatus.status !== 'win' && $gameStatus.status !== 'sub-win'}
	>
		<h3 class="text-white font-semibold">{$gameStatus.message}</h3>
	</div>
{/if}
