<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface SuggestionOption {
		id: number;
		name: string;
	}
	export let options: SuggestionOption[];
	export let placeholder: string;

	let showSuggestions: boolean;
	let selectedIndex: number | null = null;
	let searchString = '';
	let dispatcher = createEventDispatcher<{
		selected: SuggestionOption;
		new: string;
	}>();
	$: shownSuggestions = options.filter((option) =>
		option.name.toLowerCase().includes(searchString.toLowerCase())
	);

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
			searchString = shownSuggestions[selectedIndex].name;
		}
	}

	function selectOption(option: SuggestionOption) {
		dispatcher('selected', option);
	}

	function confirmContent() {
		if (searchString == '') return;

		const option = options.find((option) => option.name == searchString);
		if (option) {
			selectOption(option);
		} else {
			dispatcher('new', searchString);
		}
	}
</script>

<form
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
		class="w-full rounded bg-slate-600 p-1 text-sm text-white"
		{placeholder}
		on:keydown={updateSelection}
	/>
	<div class="relative w-full" class:hidden={!showSuggestions}>
		<div class="absolute z-10 w-full bg-slate-400 text-sm" role="listbox">
			{#each shownSuggestions as option, i}
				<button
					type="button"
					class="w-full border-t-2 px-2 text-left"
					class:bg-blue-600={selectedIndex === i}
					role="option"
					aria-selected={selectedIndex === i}
					on:click={() => selectOption(option)}>{option.name}</button
				>
			{/each}
		</div>
	</div>
</form>
