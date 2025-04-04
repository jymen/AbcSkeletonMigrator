<!--
 Audio monitor panel
-->

<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';

	import Icon from '@iconify/svelte';
	import { Slider } from '@skeletonlabs/skeleton-svelte';
	import AbcCounter from './AbcCounter.svelte';
	import type { ABCJsMidiController, AudioPanelCallbacks } from '$utils/ABCJsSound';
	import type { AbcMidiOptionsData } from '$src/utils/ABCPanelData';

	let hasPaused: boolean = false;
	let continuousPlaying: boolean = false;
	let continuous_title: string = 'continuous playing OFF';
	let slideValue = [0];
	let bpmPercent: number = 100;
	// misc GUI dynamic local classes classes
	let continuous_playing_dynamic_class: string;
	let rewind_dynamic_class: string;

	export let controller: ABCJsMidiController;
	export let scoreBPM: number;
	export let options: AbcMidiOptionsData;

	$: playing = false;
	$: timerStr = '00:00';
	$: bpm = `% ((${(scoreBPM * (bpmPercent / 100)).toFixed(0)}) BPM)`;
	$: totalBeat = 100;
	$: {
		// handle misc dynamic css classes
		continuous_playing_dynamic_class = continuousPlaying
			? 'bg-success-500 dark:bg-success-500'
			: '';
		continuous_playing_dynamic_class += playing ? ' disabled' : '';
		rewind_dynamic_class = playing ? ' disabled' : '';
	}
	onMount(() => {
		prepareTuneSound();
	});

	afterUpdate(() => {
		let callBacks: AudioPanelCallbacks = {
			timerCallback: timeUpdater,
			beatCallback: beatUpdater
		};
		controller.setCallbacks(callBacks);
	});

	let timeUpdater = (newTime: string) => {
		timerStr = newTime;
	};

	// Callback function
	let beatUpdater = (newBeat: number, totalBeats: number) => {
		slideValue[0] = newBeat;
		totalBeat = totalBeats;
		if (newBeat == totalBeat) {
			rewindPlayer();
		}
	};

	let bpmChanged = (e: CustomEvent<any>) => {
		console.log('bpm value changed');
		let newValue: number = e.detail.counter;
		if (newValue > 0 && newValue <= 100) bpmPercent = newValue;
		let tempo = scoreBPM * (bpmPercent / 100);
		controller.resetTune();
		controller.prepareTune(tempo, options);
	};

	let sliderChanged = () => {
		console.log('slider position changed :', slideValue);
	};

	async function prepareTuneSound() {
		let tempo = scoreBPM * (bpmPercent / 100);
		if (!controller.isReady) {
			await controller.prepareTune(tempo, options);
		}
	}

	// must be async event in order to display SVG progress
	async function playerStarter() {
		console.log('player started ');
		prepareTuneSound();
		playing = !playing;
		if (playing) {
			if (!hasPaused) {
				controller.seek(slideValue[0] / 100);
				controller.startTune();
			} else {
				controller.resumeTune();
			}
		} else {
			hasPaused = true;
			controller.pauseTune();
		}
	}

	function reloadPlayer() {
		if (!playing) {
			console.log('player reloaded ');
			playing = false;
			hasPaused = false;
			continuousPlaying = !continuousPlaying;
			if (continuousPlaying) {
				continuous_title = 'continuous playing ON';
			} else {
				continuous_title = 'continuous playing OFF';
			}
		}
	}

	function rewindPlayer() {
		console.log('player rewound ');
		playing = !playing;
		hasPaused = false;
		slideValue[0] = 0;
		timerStr = '00:00';
	}
</script>

<div class="flex flex-cols bg-secondary-100 mx-3 rounded-xl items-center">
	<button
		type="button"
		class="mx-1 btn-icon btn-icon-sm preset-filled {continuous_playing_dynamic_class}"
		title={continuous_title}
		on:click={reloadPlayer}
	>
		<Icon icon="streamline:arrow-reload-horizontal-1-solid" height="1em" width="1em" />
	</button>
	<button
		type="button"
		class="mx-1 btn-icon btn-icon-sm preset-filled {rewind_dynamic_class}"
		on:click={!playing ? rewindPlayer : null}
	>
		<Icon
			icon="material-symbols:text-select-jump-to-beginning-rounded"
			height="1.5em"
			width="1.5em"
		/>
	</button>
	<button
		type="button"
		class="mx-1 btn-icon btn-icon-sm preset-filled"
		on:click={async (e) => {
			await playerStarter();
		}}
	>
		{#if playing}
			<Icon icon="bi:pause-fill" height="1em" width="1em" />
		{:else}
			<Icon icon="bi:play-fill" height="1em" width="1em" />
		{/if}
	</button>

	<Slider
		name="abc-audio-slider"
		classes="mx-1 grow"
		value={slideValue}
		max={totalBeat}
		onValueChange={sliderChanged}
	/>

	<span class="text-xs">{timerStr}</span>
	<AbcCounter
		class="flex-none px-1 w-20 "
		counter={String(bpmPercent)}
		textSize="text-xs"
		on:counter-changed={bpmChanged}
	></AbcCounter>
	<span class="text-xs">{bpm}</span>
</div>

<style lang="postcss">
	.disabled {
		@apply cursor-not-allowed opacity-50;
	}
</style>
