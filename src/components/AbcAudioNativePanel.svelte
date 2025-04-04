<!--
  Sample copyright component
-->

<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import pkg from 'abcjs';
	const { synth } = pkg;
	import { type SynthObjectController, type SynthOptions } from 'abcjs';
	import type { AbcMidiOptionsData } from '$src/utils/ABCPanelData';
	import { midiInstruments } from '$utils/ABCPanelData';
	class CursorControl {
		onReady() {}

		onStart() {
			console.log('abcId : ', abcId);
			var svg = document.querySelector(abcId + ' svg');
			var cursor = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			cursor.setAttribute('class', 'abcjs-cursor');
			cursor.setAttributeNS(null, 'x1', '0');
			cursor.setAttributeNS(null, 'y1', '0');
			cursor.setAttributeNS(null, 'x2', '0');
			cursor.setAttributeNS(null, 'y2', '0');
			svg!.appendChild(cursor);
		}
		beatSubdivisions = 2;
		onBeat(beatNumber, totalBeats, totalTime) {}

		onEvent(ev) {
			if (ev.measureStart && ev.left === null) return; // this was the second part of a tie across a measure line. Just ignore it.

			var lastSelection = document.querySelectorAll(abcId + ' svg .highlight');
			for (var k = 0; k < lastSelection.length; k++) lastSelection[k].classList.remove('highlight');

			for (var i = 0; i < ev.elements.length; i++) {
				var note = ev.elements[i];
				for (var j = 0; j < note.length; j++) {
					note[j].classList.add('highlight');
				}
			}

			var cursor = document.querySelector(abcId + ' svg .abcjs-cursor');
			if (cursor) {
				cursor.setAttribute('x1', String(ev.left - 2));
				cursor.setAttribute('x2', String(ev.left - 2));
				cursor.setAttribute('y1', ev.top);
				cursor.setAttribute('y2', ev.top + ev.height);
			}
		}
		onFinished() {
			var els = document.querySelectorAll('svg .highlight');
			for (var i = 0; i < els.length; i++) {
				els[i].classList.remove('highlight');
			}
			var cursor = document.querySelector(abcId + ' svg .abcjs-cursor');
			if (cursor) {
				cursor.setAttribute('x1', '0');
				cursor.setAttribute('x2', '0');
				cursor.setAttribute('y1', '0');
				cursor.setAttribute('y2', '0');
			}
		}
	}

	let synthControl: SynthObjectController;
	let cursorControl: CursorControl = new CursorControl();

	export let abcId: string;
	export let visualObj: any;
	export let audioOptions: AbcMidiOptionsData;

	onMount(() => {
		if (synth.supportsAudio()) {
			synthControl = new synth.SynthController();
			synthControl.load('#audio', cursorControl, {
				displayLoop: true,
				displayRestart: true,
				displayPlay: true,
				displayProgress: true,
				displayWarp: true
			});
		} else {
			document.getElementById('#audio')!.innerHTML =
				"<div class='audio-error'>Audio is not supported in this browser.</div>";
		}
		setTune(false, audioOptions);
	});

	afterUpdate(() => {});

	export const setTune = (userAction: boolean, options: AbcMidiOptionsData) => {
		synthControl.disable(true);
		let instrument = midiInstruments[options.instrument][1] as number;
		let synthoptions: SynthOptions = {
			chordsOff: !options.chords,
			voicesOff: !options.melody,
			program: instrument
		};
		console.log('instrument : ', instrument);
		synthControl.setTune(visualObj[0], userAction, synthoptions);
		console.log('inited');
	};

	/*
	let setTune1 = (userAction: boolean) => {
		//synthControl.disable(true);
		let instrument = midiInstruments[audioOptions.instrument][1] as number;
		console.log('instrument : ', midiInstruments[audioOptions.instrument][1]);
		let midiBuffer = new synth.CreateSynth();
		midiBuffer
			.init({
				visualObj: visualObj[0],
				options: {
					chordsOff: !audioOptions.chords,
					voicesOff: !audioOptions.melody,
					program: instrument
				}
			})
			.then(function (response) {
				console.log(response);
				if (synthControl) {
					synthControl
						.setTune(visualObj[0], userAction)
						.then(function (response) {
							console.log('Audio successfully loaded.');
						})
						.catch(function (error) {
							console.warn('Audio problem:', error);
						});
				}
			})
			.catch(function (error) {
				console.warn('Audio problem:', error);
			});
	};
	*/
</script>

<footer class="text-center">
	<div id="audio"></div>
</footer>
