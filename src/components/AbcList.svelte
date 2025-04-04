<!-- Javascript code -->
<script lang="ts">
	import { Combobox } from '@skeletonlabs/skeleton-svelte';

	interface IComboboxData {
		label: string;
		value: string;
	}

	const midiInstruments: IComboboxData[] = [
		{ label: 'Acoustic  piano', value: 'AP' },
		{ label: 'electric piano', value: 'EP' },
		{ label: 'Synthesizer', value: 'SYN' },
		{ label: 'Violin', value: 'VIO' },
		{ label: 'Viola', value: 'VIO' },
		{ label: 'Cello', value: 'CEL' },
		{ label: 'Double bass', value: 'DB' },
		{ label: 'Guitar', value: 'GUITAR' },
		{ label: 'Bass guitar', value: 'BASS' },
		{ label: 'Flute', value: 'FLUTE' },
		{ label: 'Clarinet', value: 'CLARINET' },
		{ label: 'Saxophone', value: 'SAXOPHONE' },
		{ label: 'Oboe', value: 'OBOE' },
		{ label: 'Bassoon', value: 'BASSOON' },
		{ label: 'Trumpet', value: 'TRUMPET' },
		{ label: 'Trombone', value: 'TROMBONE' },
		{ label: 'Tuba', value: 'TUBA' },
		{ label: 'French horn', value: 'FH' },
		{ label: 'Harp', value: 'HARP' },
		{ label: 'Accordion', value: 'ACCORDION' },
		{ label: 'Harmonica', value: 'HARMONICA' },
		{ label: 'Synth pad', value: 'PAD' }
	];
	const icons = ['emojione-monotone:violin', 'wpf:guitar', 'wpf:guitar'];

	let { withIcons = false, instrumentsList = midiInstruments, instrumentSelected } = $props();

	let instrument: number = $state(0);
	let selected: string[] = $state([instrumentsList[0].label]);

	$effect(() => {
		// the svelte compiler will infer that this anonymous function needs to run every time input changes
		console.log(`new selection input: ${selected}`);
		let i = 0;
		for (var item of instrumentsList) {
			if (selected[0] == item.label) {
				instrumentSelected(i);
			}
			i++;
		}
	});
</script>

<div class="px-2">
	<div class="card w-60 z-50 shadow-xl py-2">
		<Combobox
			data={midiInstruments}
			value={selected}
			onValueChange={(e) => (selected = e.value)}
			label="Select Country"
			placeholder="Select..."
		>
			<!-- This is optional. Combobox will render label by default -->
			{#snippet item(item)}
				<div class="flex w-full justify-between space-x-2">
					<span>{item.label}</span>
				</div>
			{/snippet}
		</Combobox>

		<div class="arrow bg-surface-100-900"></div>
	</div>
</div>
