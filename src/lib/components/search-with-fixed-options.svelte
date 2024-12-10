<script lang="ts">
	import SearchWithSuggestions from './search-with-suggestions.svelte';

	interface SuggestionOption {
		id: number;
		name: string;
	}
	export let options: SuggestionOption[];
	export let placeholder: string;

	let searchString = '';
	$: shownSuggestions = options.filter((option) =>
		option.name.toLowerCase().includes(searchString.toLowerCase())
	);

	function updateSuggestions(event: CustomEvent<string>) {
		searchString = event.detail;
	}
</script>

<SearchWithSuggestions
	{shownSuggestions}
	{placeholder}
	on:search={updateSuggestions}
	on:new
	on:selected
/>
