<script lang="ts">
	import ApplicationBar from '$src/components/ApplicationBar.svelte';

	import '../app.css';
	let { children } = $props();
</script>

<ApplicationBar />

{@render children()}
