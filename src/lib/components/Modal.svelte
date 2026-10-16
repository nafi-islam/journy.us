<script lang="ts">
	// shared dialog frame (skeleton 5 Dialog) used by the stats, settings, help and practice modals
	import type { Snippet } from 'svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import IconX from '@tabler/icons-svelte-runes/icons/x';
	import { game, type DialogName } from '#lib/game.svelte.ts';

	interface Props {
		name: Exclude<DialogName, null>;
		title: string;
		icon?: Snippet;
		children: Snippet;
	}

	let { name, title, icon, children }: Props = $props();

	// slide up + fade in (and back out) when the dialog opens / closes
	const animation =
		'transition transition-discrete opacity-0 translate-y-8 starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-8 data-[state=open]:opacity-100 data-[state=open]:translate-y-0 motion-reduce:transition-none';
</script>

<Dialog
	open={game.dialog === name}
	onOpenChange={(details) => {
		if (!details.open) game.closeDialog();
	}}
>
	<Portal>
		<Dialog.Backdrop
			data-testid="dialog-backdrop"
			class="fixed inset-0 z-50 bg-surface-950/60 backdrop-blur-[2px]"
		/>
		<Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center p-4">
			<Dialog.Content
				class="max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto card border border-surface-200-800 bg-surface-50-950 p-4 shadow-2xl sm:p-6 {animation}"
			>
				<!-- Header -->
				<header class="flex items-center justify-between gap-2">
					<Dialog.Title class="flex items-center gap-2 h4">
						{@render icon?.()}
						{title}
					</Dialog.Title>
					<Dialog.CloseTrigger class="btn-icon hover:preset-tonal" aria-label="Close">
						<IconX class="size-5" />
					</Dialog.CloseTrigger>
				</header>

				{@render children()}

				<!-- Footer -->
				<footer class="flex justify-end pt-2">
					<Dialog.CloseTrigger class="btn preset-tonal">Close</Dialog.CloseTrigger>
				</footer>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
