<script lang="ts">
	export let showModal = false;
	export let title: string;

	let dialog: HTMLDialogElement;

	$: if (dialog && showModal) {
		dialog.showModal();
	} else if (dialog) {
		dialog.close();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
	class="min-w-96 rounded-md backdrop:bg-black backdrop:bg-opacity-50"
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<header class="flex flex-row bg-slate-500">
			<h2 class="m-2 ml-5 grow text-2xl font-bold text-slate-100">{title}</h2>
			<button
				class="ml-10 size-8 rounded-bl-lg bg-black bg-opacity-60 text-xl transition hover:bg-opacity-75"
				on:click={() => dialog.close()}
			>
				<i class="bx bx-x text-slate-100"></i>
			</button>
		</header>
		<div class="bg-slate-700 p-4 text-slate-200">
			<slot />
		</div>
	</div>
</dialog>
