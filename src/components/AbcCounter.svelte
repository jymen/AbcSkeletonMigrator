<!-- 

  plus minus counter component 

-->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let counter = '0';
	export let label: string | undefined = undefined;
	export let textSize = '';
	let className = '';
	export { className as class };

	function counterChanged(event) {
		counter = event.target.value;
		dispatch('counter-changed', { counter: counter });
	}
</script>

<!--  Counter -->
<div class="flex items-center {className}">
	{#if label != undefined}
		<span class="px-1 align-baseline">{label}</span>
	{/if}
	<input
		on:input={counterChanged}
		type="number"
		class="input {textSize}"
		name="custom-input-number"
		bind:value={counter}
	/>
	{#if label != undefined}
		<span class="px-1 align-baseline">{label}</span>
	{/if}
	<div class="px-1"></div>
</div>

<style>
</style>
