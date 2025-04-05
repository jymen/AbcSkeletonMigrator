<script lang="ts">
	import transpositionImg from '$lib/assets/transposition.png';
	import AbcCardMenu from './AbcCardMenu.svelte';
	import { createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';

	const dispatch = createEventDispatcher();

	function transposePlus(event) {
		dispatch('transpose-changed', { counter: 1 });
	}
	function transposeMinus(event) {
		dispatch('transpose-changed', { counter: -1 });
	}
</script>

<div>
	{#snippet child()}
		<div class="flex flex-row">
			<a href={null} type="button" class="mx-2 btn btn-sm preset-filled" on:click={transposePlus}>
				<Icon icon="mdi:plus" height="2em" width="2em" />
			</a>
			<a href={null} type="button" class="mx-2 btn btn-sm preset-filled" on:click={transposeMinus}>
				<Icon icon="mdi:minus" height="2em" width="2em" />
			</a>
		</div>
	{/snippet}

	<AbcCardMenu
		{child}
		buttonLabel="Transpose"
		panelLabel="by 1 semitone"
		image={transpositionImg}
	/>
</div>
