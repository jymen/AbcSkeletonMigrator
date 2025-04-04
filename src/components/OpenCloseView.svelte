<script lang="ts">
	import Icon from '@iconify/svelte';

	let { id, opened, toggleOpenClose } = $props();
</script>

<button type="button" class="my-1 chip preset-tonal border border-surface-500" onclick={() => toggleOpenClose(id)}>
	<span>
		{#if opened}
			<Icon icon="mdi:hide-outline" height="1em" width="1em" />
		{:else}
			<Icon icon="mdi:show-outline" height="1em" width="1em" />
		{/if}
	</span>
	{#if !opened}
		<span>show {id}</span>
	{/if}
</button>
