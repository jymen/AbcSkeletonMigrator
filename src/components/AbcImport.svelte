<script lang="ts">
	import { goto } from '$app/navigation';
	import AbcTextIcon from '$src/components/AbcTextIcon.svelte';

	export let text: string | undefined = undefined;

	function hasText() {
		return text !== undefined;
	}
</script>

<button
	class="{hasText() ? 'listBoxItem' : 'btn-icon preset-filled'} bg-surface-200/40"
	title="Import"
	on:click={() => goto('/import', { replaceState: false })}
>
	<AbcTextIcon {text} icon="solar:import-bold" />
</button>
