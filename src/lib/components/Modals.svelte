<script lang="ts">
	// all the modals in one place. +layout.svelte loads this file lazily (after the first paint),
	// so the dialog code isn't part of the initial download
	import DailyChallengeModal from './DailyChallengeModal.svelte';
	import PracticeModal from './PracticeModal.svelte';
	import SettingsModal from './SettingsModal.svelte';
	import HelpModal from './HelpModal.svelte';
</script>

<DailyChallengeModal />
<PracticeModal />
<SettingsModal />
<HelpModal />
