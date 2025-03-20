<script lang="ts">
	import Icon from '@iconify/svelte';

	export let text: string | undefined = undefined;
	export let icon: string = 'mdi:tools';

	function hasText() {
		return text !== undefined;
	}
</script>

{#if text}
	<span class="flex items-center flex-line text-success-800 dark:text-success-200">
		<Icon width="2em" height="2em" {icon} />
		<span class="pl-1">
			{text}
		</span>
	</span>
{:else}
	<Icon width="2em" height="2em" class="text-success-800 dark:text-success-200" {icon} />
{/if}
