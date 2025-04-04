<!--
  decicated midi playing options panel
-->

<script lang="ts">
	import type { AbcMidiOptionsData } from '$src/utils/ABCPanelData';
	import AbcCheckBox from './AbcCheckBox.svelte';
	import AbcMidiInstruments from './AbcMidiInstruments.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let chords: boolean;
	export let melody: boolean;
	export let metronome: boolean;
	export let instrument: number;

	let outData: AbcMidiOptionsData;

	const drumBeats = {
		// the array is [0]=drum [1]=drumIntro
		'2/4': ['dd 76 77 60 30', 2],
		'3/4': ['ddd 76 77 77 60 30 30', 1],
		'4/4': ['dddd 76 77 77 77 60 30 30 30', 1],
		'5/4': ['ddddd 76 77 77 76 77 60 30 30 60 30', 1],
		'Cut Time': ['dd 76 77 60 30', 2],
		'6/8': ['dd 76 77 60 30', 2],
		'9/8': ['ddd 76 77 77 60 30 30', 1],
		'12/8': ['dddd 76 77 77 77 60 30 30 30', 1]
	};

	function notifyChange() {
		dispatch('optionDataChanged', {
			data: { outData }
		});
	}

	function setChords() {
		outData = { chords: !chords, melody: melody, metronome: metronome, instrument: instrument };
		notifyChange();
	}

	function setMelody() {
		outData = { melody: !melody, chords: chords, metronome: metronome, instrument: instrument };
		notifyChange();
	}

	function setMetronome() {
		outData = { melody: melody, chords: chords, metronome: !metronome, instrument: instrument };
		notifyChange();
	}

	function setInstrument(event) {
		outData = {
			instrument: event.detail.instrument,
			chords: chords,
			metronome: metronome,
			melody: melody
		};
		notifyChange();
	}
</script>

<div
	class="flex flex-row bg-secondary-100 mx-2 my-2 rounded-xl items-center border-2 border-solid border-primary-500"
>
	<AbcCheckBox
		label="Chords"
		id="chordsCheckBox"
		checked={chords}
		on:abcCheckboxChanged={setChords}
	/>
	<AbcCheckBox
		label="Melody"
		id="melodyCheckBox"
		checked={melody}
		on:abcCheckboxChanged={setMelody}
	/>
	<AbcCheckBox
		label="Metronome"
		id="metronomeCheckBox"
		checked={metronome}
		on:abcCheckboxChanged={setMetronome}
	/>
	<AbcMidiInstruments size={1} {instrument} on:instrumentChanged={setInstrument} />
</div>
