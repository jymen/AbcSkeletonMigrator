<!-- Javascript code -->
<script lang="ts">
	import AbcList from './AbcList.svelte';
	const instruments: any = [
		{ label: 'Violin (std tuning)', value: 'violin' },
		{ label: 'Guitar (std tuning)', value: 'guitar' },
		{ label: 'Guitar (DADGAD)', value: 'dadgad' }
	];

	let { instrumentOut } = $props();

	function instrumentSelected(newInstrument: number) {
		console.log('instrumentSelected :', newInstrument);
		instrumentOut(newInstrument);
	}
</script>

<AbcList withIcons={true} instrumentsList={instruments} {instrumentSelected} />
