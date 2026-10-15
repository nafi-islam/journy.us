<script lang="ts">
	import IconBrandSvelte from '@tabler/icons-svelte-runes/icons/brand-svelte';
	import IconBrandGithub from '@tabler/icons-svelte-runes/icons/brand-github';
	import IconHeart from '@tabler/icons-svelte-runes/icons/heart';
</script>

<!-- each group stays on one line; on narrow phones whole groups wrap instead of words -->
<footer
	class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-6 text-sm opacity-80"
>
	<!-- Built with Svelte Icon -->
	<span class="flex items-center gap-1 whitespace-nowrap">
		powered by
		<a
			href="https://svelte.dev"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="svelte"
			class="transition-colors hover:text-primary-500"
		>
			<IconBrandSvelte class="size-5" />
		</a>
	</span>
	<span aria-hidden="true">|</span>
	<span class="flex items-center gap-1 whitespace-nowrap">
		made by
		<a
			href="https://nafiislam.com"
			target="_blank"
			rel="noopener noreferrer"
			class="bg-gradient-to-br from-red-500 to-yellow-500 bg-clip-text font-hand font-bold text-transparent transition hover:from-red-600 hover:to-yellow-600"
		>
			NAFI
		</a>
		with
		<IconHeart class="size-4" />
	</span>
	<span aria-hidden="true">|</span>
	<a
		href="https://github.com/nafi-islam/journy.us"
		target="_blank"
		rel="noopener noreferrer"
		aria-label="github"
		class="transition-colors hover:text-primary-500"
	>
		<IconBrandGithub class="size-5" />
	</a>
</footer>
