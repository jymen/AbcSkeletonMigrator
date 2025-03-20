<script lang="ts">
	import Icon from '@iconify/svelte';
	import { abcStore } from '$src/store';

	let { isAdmin } = abcStore;

	function newAdmin() {
		$isAdmin = !$isAdmin;
		console.log(`newAdmin ${isAdmin}`);
	}

	function coloring() {
		return isAdmin ? 'red' : 'green';
	}
</script>
<button
	type="button"
	onclick={newAdmin}
	title={$isAdmin ? 'Edit mode' : 'view mode'}
	class="btn-icon bg-surface-200/40"
>
<span >
	<Icon class={$isAdmin ? 'text-error-800 dark:text-error-200' : 'text-success-800 dark:text-success-200'} width="1.25em" height="1.25em"  
	icon="clarity:administrator-line" />
</span>
</button>
