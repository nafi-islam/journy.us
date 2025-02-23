<script>
	import Prompt from '$lib/components/Prompt.svelte';
	import Map from '$lib/components/Map.svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';
</script>

<div
	class="container min-h-screen mx-auto flex flex-col items-center justify-start overflow-y-auto"
>
	<div class="space-y-10 text-center flex flex-col items-center">
		<h2 class="h2">your journy today is...</h2>

		<!-- Prompt -->
		<Prompt />

		<!-- Map -->
		<Map />

		<!-- Autocomplete -->
		<Autocomplete />
	</div>
</div>
