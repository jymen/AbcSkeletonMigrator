<!--
  Show help pdf page for abc
	TODO : ( see pdfmake package for ABC Formatting and printing )
-->

<script lang="ts">
	import { goto } from '$app/navigation';

	import AbcTextIcon from '$src/components/AbcTextIcon.svelte';

	export let text: string | undefined = undefined;

	function hasText() {
		return text !== undefined;
	}

	function computeClass() {
		if (hasText()) {
			return '';
		}
		return 'btn-icon preset-filled bg-surface-200/40';
	}
</script>

<button
	on:click={() => goto('/help', { replaceState: false })}
	title="Abc tools"
	class={computeClass()}
>
	<AbcTextIcon {text} icon="mdi:help" />
</button>
