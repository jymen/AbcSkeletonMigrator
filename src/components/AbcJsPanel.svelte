<script lang="ts">
	import abcjs, { type AbcVisualParams } from 'abcjs';
	import 'abcjs/abcjs-audio.css';
	import Icon from '@iconify/svelte';
	import { jsPDF } from 'jspdf';
	import 'svg2pdf.js';

	import { afterUpdate, beforeUpdate, onMount, tick } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	import AbcEditorPanel from './AbcEditorPanel.svelte';
	import AbcAudioPanel from './AbcAudioPanel.svelte';
	import AbcAudioNativePanel from './AbcAudioNativePanel.svelte';
	import AbcTranspose from '$src/components/AbcTranspose.svelte';
	import AbcTablature from './AbcTablature.svelte';
	import { ABCJsMidiController, SvgFactory, SoundEvent } from '$utils/ABCJsSound';
	import AbcScoreWarnings from './AbcScoreWarnings.svelte';
	import { abcStore, AbcScoreData } from '$src/store';

	import AbcMidiOptions from './AbcMidiOptions.svelte';
	import type { AbcMidiOptionsData } from '$src/utils/ABCPanelData';
	import type { FileFolderCard } from '$src/data/AbcDataDisplay';
	import { BlockInfo } from '@codemirror/view';

	export let card: FileFolderCard;
	//export let score = '"X:1\nK:D\nDD AA|BBA2|\n"';
	//export let instance: number; // ABC Viewer instance number
	let { scoreContext, tablatureChanged } = abcStore;

	const dispatch = createEventDispatcher();

	let visualObj: any;
	let sound: ABCJsMidiController;

	let showAbcSource = false;

	// parent infos elements
	let score = card.abc;
	let instance = card.index;
	let oid = card.element.e.oid.oid;

	let zoom = 1; // scaling score
	let abcElem: HTMLElement;
	let svgElem: SVGSVGElement | null;
	let bpmScore: number;
	let svgEventFactory: SvgFactory | undefined = undefined;
	let test: boolean = false;
	let playingInProgress: boolean = false;
	let classPlaying: string = '';
	let showAbcNativeMidi: boolean = false;
	let tuneBook: abcjs.TuneBook | undefined = undefined;
	let abcChangeLabel = 'Edit';
	let printJS;

	$: abcChanged = score;
	$: abcId = 'paper-' + instance;
	let textChanged = false;
	let abcSourceModified = true;
	$: warnings = undefined;
	$: playingClass = classPlaying;
	$: $tablatureChanged, onTablatureChange();

	const onTablatureChange = () => {
		console.log('tablature changed');
		const scoreContext = $scoreContext.getContext(oid);
		console.log('tablatureChanged :', $tablatureChanged);
		console.log('context ID :', scoreContext.oid);
		console.log('context check :', scoreContext.tablatureChecked);
		console.log('context tab :', scoreContext.tabInstrument);
		if (scoreContext.tablatureChecked) {
			// show tablature
			visualOptions.tablature = [scoreContext.tabInstrument];
		} else {
			visualOptions.tablature = [];
		}
		abcOptionsChanged(undefined);
	};

	const visualOptions: AbcVisualParams = {
		responsive: 'resize',
		scale: zoom,
		add_classes: true,
		tablature: []
	};

	let audioOptions: AbcMidiOptionsData = {
		chords: true,
		melody: true,
		metronome: false,
		instrument: 0
	};

	let audioPanel;

	interface AbcUpdates {
		title: string;
		source: string;
	}
	// source + title modifications stored here
	let abcUpdates: AbcUpdates | undefined = undefined;

	onMount(async () => {
		abcId = 'paper-' + instance;
		abcChanged = score;
		audioPanel = AbcAudioPanel;
		sound = new ABCJsMidiController();
		sound.setSvgNotifier(updatePlayingScore);
		// load printJS
		const p = await import('print-js');
		printJS = p.default;
	});

	beforeUpdate(() => {
		console.log('Before dom update ...');
	});

	afterUpdate(() => {
		console.log('AbcJs score is mounted ...');
		warnings = undefined; // cleanup
		if (!playingInProgress) {
			console.log('abc content :', abcChanged);
			visualObj = abcjs.renderAbc(abcId, abcChanged, visualOptions);
			if (visualObj.length > 0) {
				bpmScore = visualObj[0].getBpm();
				console.log('bpm :', bpmScore);
				warnings = visualObj[0].warnings;
				svgElem = abcElem.querySelector('svg');
				if (svgElem == undefined) {
					warnings = 'internal sound error : NO SVG elements' as any;
				}
				if (svgEventFactory == undefined) {
					svgEventFactory = new SvgFactory(svgElem!);
				}
			}
		}
	});

	function showSource() {
		showAbcSource = !showAbcSource;
		if (showAbcSource) {
			abcChangeLabel = 'Save';
		} else {
			abcChangeLabel = 'Edit';
		}
		console.log('editButton:', abcChangeLabel);
		if (!showAbcSource && abcSourceModified) {
			// trigger db update
			dispatch('score-changed', abcUpdates);
			abcUpdates = undefined;
			abcSourceModified = false;
		}
	}

	function soundMidiNative() {
		showAbcNativeMidi = !showAbcNativeMidi;
	}

	function transpose(event) {
		console.log(`transpose ${event.detail.counter}`);
		// populate new transposed source
		abcChanged = abcjs.strTranspose(abcChanged, visualObj, 1);
		//		let visualObj =
	}

	async function printScore(event) {
		console.log(`print score `);
		const doc = new jsPDF();
		const svg = svgElem;
		await doc.svg(svg!, {
			x: 0,
			y: 0
		});
		// print pdf
		const blob: Blob = await doc.output('blob'); // base64 string
		const b = await blob.arrayBuffer();
		const u8 = new Uint8Array(b);
		let binary = '';
		var bytes = [].slice.call(u8);
		bytes.forEach((b) => (binary += String.fromCharCode(b)));
		const base = btoa(binary);
		printJS({ type: 'pdf', printable: base, base64: true });
	}

	function zoomIn(event) {
		console.log(`zoom in  `);
		zoom += 0.25;
		visualOptions.scale = zoom;
		visualOptions.responsive = undefined;
		abcOptionsChanged(event);
	}

	function zoomOut(event) {
		console.log(`zoom out  `);
		zoom -= 0.25;
		visualOptions.scale = zoom;
		visualOptions.responsive = undefined;
		console.log(visualOptions.scale);
		abcOptionsChanged(event);
	}

	let abcSourceChanged = (event: any) => {
		console.log('text changed');
		abcChanged = event.detail.newSource;
		warnings = undefined;
		visualObj = abcjs.renderAbc(abcId, abcChanged, visualOptions);
		if (visualObj.length > 0) {
			textChanged = !textChanged;
			tuneBook = new abcjs.TuneBook(abcChanged);
			let infos = tuneBook.tunes[0];
			// notify title changed in score
			abcSourceModified = true;
			abcUpdates = {
				title: infos.title,
				source: abcChanged
			};
		}
	};

	let abcOptionsChanged = (event: any) => {
		console.log('options changed');
		warnings = undefined;
		visualObj = abcjs.renderAbc(abcId, abcChanged, visualOptions);
	};

	let audioOptionsChanged = (event) => {
		// update control accordingly
		audioOptions = event.detail.data.outData;
		if (showAbcNativeMidi) {
			if (audioPanel != undefined) {
				console.log('audioOption Changed', audioOptions);
				audioPanel.setTune(true, audioOptions);
			}
		}
	};

	async function updatePlayingScore(event: SoundEvent, data: any) {
		switch (event) {
			case SoundEvent.ready:
				break;
			case SoundEvent.lineEnd:
				break;
			case SoundEvent.start:
				playingInProgress = true;
				svgEventFactory?.createLine();
				break;
			case SoundEvent.finished:
				svgEventFactory?.endCursor();
				playingInProgress = false;
				break;
			case SoundEvent.beat:
				break;
			case SoundEvent.event:
				svgEventFactory?.hideLastCursor();
				svgEventFactory?.setNewCursor(data.event);
				await tick();
				break;
		}
		test = !test;
		if (classPlaying == '') {
			classPlaying = 'abc_playing';
		} else {
			classPlaying = '';
		}
		console.log('classPlaying ', classPlaying);
	}
</script>

<!--  Instruments -->

<div class="grid grid-cols-1 grid-rows-1">
	<div class="flex flex-col card">
		<header class="card-header flex flex-line justify-left">
			<!--  transposition -->
			<AbcTranspose on:transpose-changed={transpose} />
			<!--  zoom -->
			<button type="button" class="mx-2 btn btn-sm preset-filled" on:click={zoomIn}>
				<Icon icon="material-symbols-light:zoom-in" height="2em" width="2em" />
			</button>
			<button type="button" class="btn btn-sm preset-filled" on:click={zoomOut}>
				<Icon icon="material-symbols-light:zoom-out" height="2em" width="2em" />
			</button>
			<!--  Instruments -->
			<AbcTablature klass="px-1" {oid}></AbcTablature>
			<div class="px-1">
				<button type="button" on:click={showSource} class="btn preset-filled"
					>{abcChangeLabel}</button
				>
			</div>
			<div class="px-1">
				<button
					type="button"
					class="btn btn-sm preset-filled"
					on:click={soundMidiNative}
					title="Midi player"
				>
					<Icon icon="mdi:midi-port" height="2em" width="2em" />
				</button>
			</div>
			<button type="button" class="btn btn-sm preset-filled" on:click={printScore}>
				<Icon icon="material-symbols:print-outline" height="1.75em" width="1.75em" />
			</button>
		</header>
		<!--
		<div id="player" class="py-2" bind:this={abcPlayer}></div>
		-->
		<section class="p-2">
			{#if warnings}
				<AbcScoreWarnings warning={warnings} />
				<hr class="!border-t-2" />
			{/if}
			<div id={abcId} class={playingClass} bind:this={abcElem}></div>
		</section>

		{#if showAbcNativeMidi}
			<AbcMidiOptions
				chords={audioOptions.chords}
				melody={audioOptions.melody}
				metronome={audioOptions.metronome}
				instrument={audioOptions.instrument}
				on:optionDataChanged={audioOptionsChanged}
			/>
			<AbcAudioNativePanel abcId={'#' + abcId} {visualObj} {audioOptions} bind:this={audioPanel}
			></AbcAudioNativePanel>
		{/if}

		{#if showAbcSource}
			<section class="p-4">
				<div class="flex-1 overflow-auto border-dotted border-2 rounded-lg border-black p-3 h-60">
					<AbcEditorPanel source={abcChanged} on:AbcSource-changed={abcSourceChanged} />
				</div>
			</section>
		{/if}
		<footer class="card-footer"></footer>
	</div>
</div>

<style lang="postcss">
	/*body { @apply bg-primary-50-900-token; } */
	@reference "../app.css";

	.abcjs-container {
		@apply bg-secondary-50 dark:bg-secondary-600;
		border-radius: 25px;
	}

	:global(.abcjs-midi-tempo) {
		max-height: 25px;
		font-size: 10px;
	}

	:global(.abcjs-inline-audio .abcjs-midi-clock) {
		font-size: 10px;
	}

	:global(.abcjs-midi-progress-background) {
		max-width: 450px;
	}

	:global(.abcjs-container svg) {
		fill: rgb(108, 153, 125);
		stroke: rgb(108, 153, 125);
	}

	:global(.abcjs-container svg .abcjs-clef) {
		fill: var(--color-secondary-100);
		stroke: var(--color-secondary-100);
	}

	:global(.abcjs-container svg .abcjs-key-signature) {
		fill: var(--color-secondary-500);
		stroke: var(--color-secondary-500);
	}

	/*
	:global(#paper svg .abcjs-note) {
		fill: rgb(24, 92, 42);
		stroke: rgb(24, 92, 42);
	}
	:global(#paper svg .abcjs-beam-elem) {
		fill: rgb(24, 92, 42);
		stroke: rgb(24, 92, 42);
	}
	*/
	/*
	:global(#paper svg .abcjs-note_selected) {
		fill: red;
		stroke: red;
	}
*/
	:global(.abcjs-container svg .abcjs-bar) {
		fill: black;
		stroke: black;
	}

	:global(.highlight) {
		fill: red;
		stroke: red;
	}

	:global(.abcjs-cursor) {
		stroke: red;
		fill: red;
	}

	:global(.abcjs-note_selected) {
		fill: #0acc51;
	}

	:global(.abcjs-inline-audio) {
		@apply bg-primary-700 dark:bg-primary-100;
		border-radius: 15px;
	}
	:global(.abcjs-midi-tempo) {
		@apply bg-primary-700 dark:bg-primary-100;
	}
</style>
