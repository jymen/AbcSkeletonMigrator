<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { Slider } from '@skeletonlabs/skeleton-svelte';
	import { Howl } from 'howler';

	let { audioUrl = undefined, title = '', deleteAudio } = $props();

	class HowlerDriver {
		howl: Howl;
		updatedRaf: number | undefined;
		duration: number = 0;

		public formatDuration(duration: number): string {
			const minutes = Math.floor(duration / 60);
			const seconds = Math.floor(duration % 60);
			return `${minutes}:${seconds}`;
		}

		constructor() {
			console.log('HowlerDriver constructor audio src :', audioUrl);
			this.howl = new Howl({
				src: [audioUrl],
				preload: 'metadata'
			});
			this.duration = this.howl.duration();
			totalDuration = this.formatDuration(this.duration);
			this.howl.volume(volume[0] / 10);
			this.howl.rate(speed);

			this.howl.on('play', () => {
				playing = true;
				// Define a function to be run on every animation frame
				const onAnimationFrame = () => {
					// If the howl is still playing
					if (this.howl.playing()) {
						// Calculate the width
						audioProgress[0] = (this.howl.seek() / this.howl.duration()) * 100;
						// update the current duration
						currentDuration = this.formatDuration(this.howl.seek());
						// Continue processing updates
						this.updatedRaf = requestAnimationFrame(onAnimationFrame);
					}

					// If the howl is no longer playing
					else {
						// Stop processing updates
						if (this.updatedRaf) {
							cancelAnimationFrame(this.updatedRaf);
						}
					}
				};
				// Start processing updates
				this.updatedRaf = requestAnimationFrame(onAnimationFrame);
			});
			this.howl.on('load', () => {
				this.duration = this.howl.duration();
				totalDuration = this.formatDuration(this.duration);
				console.log('tune loaded :', totalDuration);
			});
			this.howl.on('pause', () => {
				this.stopPaying();
			});
			this.howl.on('stop', () => {
				this.stopPaying();
			});
			this.howl.on('end', () => {
				this.stopPaying();
			});
		}

		stopPaying() {
			playing = false;
			if (this.updatedRaf) {
				cancelAnimationFrame(this.updatedRaf);
			}
		}

		playerStarter() {
			console.log('player started ');
			this.howl.play();
		}

		playerPause() {
			console.log('player paused ');
			this.howl.pause();
		}

		delete(): void {
			console.log('delete');
		}
	}

	let driver: HowlerDriver | undefined;

	let playing = $state(false);
	let totalDuration = $state('0:0');
	let currentDuration = $state('0:0');
	let volume = $state([5]);
	let speed = $state(1.0);
	let audioProgress = $state([0]);

	onMount(() => {
		driver = new HowlerDriver();
	});

	// TODO : implement this function as Interfaces
	//

	let sliderChanged = () => {
		console.log('slider position changed :', volume);
		driver?.howl.volume(volume[0] / 10);
	};

	async function playerStarter() {
		driver?.playerStarter();
	}

	function audioDelete() {
		// TODO: request confirmation
		deleteAudio();
	}

	function speedChanged() {
		console.log('speed changed :', speed);
		driver?.howl.rate(speed);
	}

	function progressChanged() {
		console.log('progress changed :', audioProgress);
		if (driver) {
			const curSeek = driver!.howl.duration() * (audioProgress[0] / 100);
			driver!.howl.seek(curSeek);
			currentDuration = driver!.formatDuration(curSeek);
		}
	}
</script>

<div class="mx-3">
	<p class="mx-3 text-center text-xs font-bold italic text-primary-800">{title}</p>
	<div class="flex flex-cols bg-secondary-100 rounded-xl items-center">
		<button
			type="button"
			class="player-button mx-1 btn-icon btn-icon-sm preset-filled"
			onclick={async (e) => {
				if (!playing) {
					await playerStarter();
				} else {
					driver?.playerPause();
				}
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
			value={audioProgress}
			max={100}
			onValueChange={progressChanged}
		/>

		<span class="text-xs">{currentDuration}/{totalDuration}</span>
		<span>
			<Icon class="mx-1" icon="material-symbols:speed-outline" height="1em" width="1em" />
		</span>
		<input
			bind:value={speed}
			onchange={speedChanged}
			type="number"
			max="2.0"
			min="0.5"
			step="0.25"
			class="bg-secondary-200 max-w-14 max-h-6 border border-primary-900 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
		/>

		<span>
			<Icon class="mx-1" icon="bi:volume-up-fill" height="1em" width="1em" />
		</span>

		<Slider
			classes="max-w-16 "
			name="range-slider"
			value={volume}
			onValueChange={sliderChanged}
			max={10}
			step={1}
		/>
		<button
			type="button"
			class="player-button mx-1 btn-icon btn-icon-sm preset-filled"
			onclick={audioDelete}
		>
			<Icon width="1em" height="1em" icon="ion:trash" />
		</button>
	</div>
</div>

<style>
	.player-button {
		width: 18px;
	}
</style>
