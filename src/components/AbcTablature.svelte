<script lang="ts">
	import tablatureImg from '$lib/assets/tablature.png';
	import AbcCardMenu from './AbcCardMenu.svelte';

	let { klass, oid } = $props();
</script>

<div class={klass}>
	<AbcCardMenu buttonLabel="Tablature" image={tablatureImg} {oid} tablature={true} />
</div>
