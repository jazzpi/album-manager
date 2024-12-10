<script lang="ts" generics="T extends { id: any, name: string }">
	import { createEventDispatcher } from 'svelte';

	export let shownSuggestions: T[];
	export let placeholder: string;
	export let formClasses: string = '';
	export let inputClasses: string = 'w-full rounded bg-slate-600 p-1 text-sm text-white';

	let showSuggestions: boolean;
	let selectedIndex: number | null = null;
	let searchString = '';
	let dispatcher = createEventDispatcher<{
		search: string;
		selected: T;
		new: string;
	}>();

	function updateSelection(event: KeyboardEvent) {
		if (shownSuggestions.length == 0) return;

		if (event.key == 'ArrowDown') {
			if (selectedIndex == null) {
				selectedIndex = 0;
			} else if (selectedIndex < shownSuggestions.length - 1) {
				selectedIndex++;
			} else {
				selectedIndex = null;
			}
		} else if (event.key == 'ArrowUp') {
			if (selectedIndex == null) {
				selectedIndex = shownSuggestions.length - 1;
			} else if (selectedIndex > 0) {
				selectedIndex--;
			} else {
				selectedIndex = null;
			}
		} else if (event.key == 'Enter' && selectedIndex != null) {
			selectOption(shownSuggestions[selectedIndex]);
			event.preventDefault();
		}
	}

	function selectOption(option: T) {
		dispatcher('selected', option);
	}

	function confirmContent() {
		if (searchString == '') return;

		const option = shownSuggestions.find((option) => option.name == searchString);
		if (option) {
			selectOption(option);
		} else {
			dispatcher('new', searchString);
		}
	}
</script>

<form
	class={formClasses}
	on:submit|preventDefault={() => confirmContent()}
	on:focusin={() => {
		selectedIndex = null;
		showSuggestions = true;
	}}
	on:focusout={() => setTimeout(() => (showSuggestions = false), 100)}
>
	<input
		type="text"
		bind:value={searchString}
		class={inputClasses}
		{placeholder}
		on:keydown={updateSelection}
		on:input={() => dispatcher('search', searchString)}
	/>
	<div class="relative w-full" class:hidden={!showSuggestions}>
		<div class="absolute z-10 w-full bg-slate-400 text-sm" role="listbox">
			{#each shownSuggestions as option, i}
				<button
					type="button"
					class="block w-full"
					on:click={() => selectOption(option)}
					role="option"
					aria-selected={selectedIndex === i}
				>
					<slot {option} selected={selectedIndex == i}>
						<div class="w-full border-t-2 px-2 text-left" class:bg-blue-600={selectedIndex === i}>
							{option.name}
						</div>
					</slot>
				</button>
			{/each}
		</div>
	</div>
</form>
