// every page is prerendered at build time, so vercel serves plain static files
// (the game itself runs in the browser: see src/lib/game.svelte.ts)
export const prerender = true;
