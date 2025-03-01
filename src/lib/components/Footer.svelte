<script>
	import { IconBrandSvelte, IconBrandGithub, IconHeart } from '@tabler/icons-svelte';
</script>

<footer
	class="flex justify-center items-center gap-3 py-4 text-sm text-surface-500 dark:text-surface-100 transition-colors"
>
	<!-- Built with Svelte Icon -->
	<span class="flex items-center gap-1 group">
		powered by
		<a href="https://svelte.dev" target="_blank" rel="noopener noreferrer">
			<IconBrandSvelte
				size={20}
				class="text-surface-500 dark:text-surface-100 group-hover:text-primary-500 transition duration-200"
			/>
		</a>
	</span>
	<span>|</span>
	<span class="flex items-center gap-1">
		made by
		<a
			href="https://nafiislam.com"
			target="_blank"
			rel="noopener noreferrer"
			class="journy-text text-transparent bg-clip-text box-decoration-clone bg-gradient-to-br
                from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 transition duration-200 outlined-text"
		>
			NAFI
		</a>
		with
		<IconHeart size={18} />
	</span>
	<span>|</span>
	<a
		href="https://github.com/nafi-islam"
		target="_blank"
		rel="noopener noreferrer"
		class="text-surface-500 dark:text-surface-100 transition duration-200
	 hover:text-primary-500 dark:hover:text-primary-500"
	>
		<IconBrandGithub size={20} />
	</a>
</footer>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap');

	.journy-text {
		font-family: 'Gloria Hallelujah', cursive;
		font-size: 1rem;
		font-weight: bold;
	}

	.outlined-text {
		filter: drop-shadow(0.5px 0.5px 0 black) drop-shadow(-0.5px -0.5px 0 black);
	}
</style>
