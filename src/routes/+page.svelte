<script>
	import Prompt from '$lib/components/Prompt.svelte';
	import Map from '$lib/components/Map.svelte';
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
		<h2 class="h2">your journy today is...</h2>

		<!-- Prompt -->
		<Prompt />

		<!-- Map -->
		<Map />
	</div>
</div>
