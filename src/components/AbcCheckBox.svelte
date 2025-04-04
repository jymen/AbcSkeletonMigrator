<!--
  Sample copyright component
-->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let checked: boolean = false;
	export let label: string = 'label :';
	export let id: string = 'id';
	export let eventName = 'abcCheckboxChanged';

	function statusChanged() {
		dispatch(eventName, {
			checked: { checked }
		});
	}
</script>

<div class="flex flex-row px-1">
	<label class="inline-block hover:cursor-pointer" for="checkboxDefault">
		{label}
	</label>
	<div class="items-center">
		<div class="block min-h-[1.5rem] ps-[0.5rem]">
			<input
				class="bg-primary-100 border-primary-300 text-primary-500 focus:ring-primary-200 rounded-[0.25rem]"
				type="checkbox"
				on:click={statusChanged}
				bind:checked
				{id}
			/>
		</div>
	</div>
</div>
