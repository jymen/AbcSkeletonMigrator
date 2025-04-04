<!-- Javascript code -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { midiInstruments } from '$src/utils/ABCPanelData';

	const dispatch = createEventDispatcher();

	export let size: number = 4;
	export let instrument: number = 0;

	function instrumentChanged(event) {
		dispatch('instrumentChanged', {
			instrument: Number(event.target.value)
		});
	}
</script>

<div class="px-2">
	<select class="select" {size} value={instrument} on:change={instrumentChanged}>
		{#each midiInstruments as val, i}
			<option value={i}>
				{val[0]}
			</option>
		{/each}
	</select>
	<div class="arrow bg-surface-100-900"></div>
</div>
