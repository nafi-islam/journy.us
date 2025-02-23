<script lang="ts">
	import { Autocomplete, popup } from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, PopupSettings } from '@skeletonlabs/skeleton';
	import { statesGraph } from '../statesGraph';

	let popupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'popupAutocomplete',
		placement: 'bottom'
	};

	let inputPopupDemo: string = '';

	function onPopupDemoSelect(event: any): void {
		inputPopupDemo = event.detail.label;
	}

	const states = Object.keys(statesGraph).map((state) => ({ label: state, value: state }));
</script>

<input
	class="input autocomplete w-full p-3 border rounded-md shadow-md"
	type="search"
	name="autocomplete-search"
	bind:value={inputPopupDemo}
	placeholder="Search..."
	use:popup={popupSettings}
/>
<div data-popup="popupAutocomplete">
	<Autocomplete bind:input={inputPopupDemo} options={states} on:selection={onPopupDemoSelect} />
</div>
