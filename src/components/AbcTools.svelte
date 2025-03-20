<!--
  AbcTools integration
-->

<script lang="ts">
	import Icon from '@iconify/svelte';
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

<form
	action="https://michaeleskin.com/abctools/abctools.html"
	target="_blank"
	rel="noopener noreferrer"
>
	<!--<
button type="submit" title="Abc tools" class= "{hasText() ? 'listBoxItem' : 'btn-icon variant-filled'}" >
	-->
	<button
		type="submit"
		title="Abc tools"
		class={computeClass()}
	>
		<AbcTextIcon {text} icon="mdi:tools" />
	</button>
</form>
