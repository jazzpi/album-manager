<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	import { signIn } from '@auth/sveltekit/client';
</script>

<header class="flex flex-row bg-slate-800 p-4">
	<h1 class="grow text-3xl font-bold text-slate-100">Album Manager</h1>
	{#if $page.data.session?.user?.user_id}
		<div class="my-auto text-slate-400">
			Logged in as <a
				href="https://open.spotify.com/user/{$page.data.session.user.user_id}"
				class="font-semibold hover:underline"
				target="_blank"
			>
				{$page.data.session.user.name}</a
			>
		</div>
	{/if}
</header>

{#if !$page.data.session?.user?.user_id}
	<div class="flex h-screen flex-row items-center justify-center">
		<button class="rounded bg-green-500 px-4 py-2 font-semibold" on:click={() => signIn('spotify')}>
			Sign in with Spotify
		</button>
	</div>
{:else}
	<main class="p-4 text-slate-200">
		<slot />
	</main>
{/if}
