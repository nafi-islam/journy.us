<script lang="ts">
	import { Autocomplete, popup } from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, PopupSettings } from '@skeletonlabs/skeleton';
	import { statesGraph } from '../statesGraph';

	let popupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'popupAutocomplete',
		placement: 'top'
	};

	let inputPopupDemo: string = '';

	function onPopupDemoSelect(event: any): void {
		inputPopupDemo = event.detail.label;
	}

	const states: AutocompleteOption<string, string>[] = Object.keys(statesGraph).map((state) => ({
		label: state,
		value: state
	}));
	console.log('Autocomplete States:', states);
</script>

<div class="flex flex-col space-y-4 w-full max-w-md">
	<h4 class="h4 text-center">take a guess!</h4>

	<!-- Guess Input Field -->
	<input
		class="input autocomplete w-full p-3 border rounded-md shadow-md"
		type="search"
		name="autocomplete-search"
		bind:value={inputPopupDemo}
		placeholder="Enter a state..."
		use:popup={popupSettings}
	/>

	<!-- Autocomplete Dropdown -->
	<div
		data-popup="popupAutocomplete"
		class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto absolute left-0 top-full z-50 rounded-md"
		tabindex="-1"
	>
		<Autocomplete bind:input={inputPopupDemo} options={states} on:selection={onPopupDemoSelect} />
	</div>
</div>
