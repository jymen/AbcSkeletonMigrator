<script lang="ts">
	import Icon from '@iconify/svelte';

	import { MediaAction, Media, AudioVideoMedia, ScoreMedia } from '$src/data/AbcMedias';
	import AbcFileUploadPanel from './AbcFileUploadPanel.svelte';
	import AbcMediaViewer from './AbcMediaViewer.svelte';
	import { DbOperation } from '$src/data/ABCData';
	import AbcDbUpdater from '$src/components/AbcDbUpdater.svelte';
	import { FileFolderCard } from '$src/data/AbcDataDisplay';
	import { AbcMedias } from '$src/data/AbcMedias';
	import { abcStore } from '$src/store';
	import { onMount } from 'svelte';

	let { isAdmin } = abcStore;

	function emptyUpdater() {
		return Promise.resolve();
	}

	let { card, isScore, updater_doUpdate = emptyUpdater } = $props();

	let url: string = $state('');
	let urlError: boolean = $state(false);
	let fType: string;
	let tuneDescription: string = $state('');
	let droppedFiles: FileList;
	let droppedFileName: string | undefined = $state(undefined);
	let toUpload: string | ArrayBuffer | null;
	let addOnExisting: boolean = $state(false);
	let addLabel = 'Add';
	let addMediaDisabled: boolean = $state(true);

	$effect(() => {
		console.debug('inside effect');
		if (tuneDescription == undefined || tuneDescription == '' || droppedFileName == undefined) {
			console.debug('Add Media disabled');
			addMediaDisabled = true;
		} else {
			console.debug('Add Media enabled : ' + url);
			addMediaDisabled = false;
		}
	});

	class AbcMediasPanel {
		dataContent: AbcMedias | undefined = undefined;
		curScores: ScoreMedia[] = $state([]);
		curAudios: AudioVideoMedia[] = $state([]);
		curVideos: AudioVideoMedia[] = $state([]);
		isScore: boolean;

		get isEmpty(): boolean {
			if (this.isScore) {
				return this.curScores.length == 0;
			} else {
				return this.curAudios.length == 0 && this.curVideos.length == 0;
			}
		}

		get hasContent(): boolean {
			if (this.isScore) {
				return this.curScores.length > 0;
			} else {
				return this.curAudios.length > 0 || this.curVideos.length > 0;
			}
		}

		constructor(card: FileFolderCard, isScore: boolean = false) {
			console.log(`medias panel isScore : ${isScore}`);
			this.isScore = isScore;
			if (card.element != undefined) {
				this.dataContent = card.element.m;
				const content = this.dataContent;
				if (content != undefined) {
					if (content.audios) this.curAudios = content.audios;
					if (content.videos) this.curVideos = content.videos;
					if (content.scores) this.curScores = content.scores;
					console.log('nb audios : ' + this.curAudios.length);
					console.log('nb videos : ' + this.curVideos.length);
					console.log('nb scores : ' + this.curScores.length);
				}
			}
		}

		toJson(): string {
			return JSON.stringify(this);
		}

		addVideo(video: AudioVideoMedia) {
			this.curVideos.push(video);
		}

		addAudio(audio: AudioVideoMedia) {
			this.curAudios.push(audio);
		}

		addScore(score: ScoreMedia) {
			this.curScores.push(score);
		}

		deleteVideo(video: AudioVideoMedia) {
			this.curVideos = this.curVideos.filter((v) => v !== video);
		}

		deleteAudio(audio: AudioVideoMedia) {
			this.curAudios = this.curAudios.filter((a) => a !== audio);
		}

		deleteScore(score: ScoreMedia) {
			this.curScores = this.curScores.filter((s) => s !== score);
		}
	}

	const medias = new AbcMediasPanel(card, isScore);

	async function dropChangeHandler(event) {
		// a local file has been attached
		// deal with index 0 only
		const files = event.files;
		if (files) {
			droppedFiles = files;
			for (const file of files.files) {
				// process dropped files
				droppedFileName = file.name;
				fType = file.type;
				let reader = new FileReader();
				const promise = new Promise((resolve) => {
					reader.onload = (e) => {
						const r = e.target!.result;
						resolve(r as ArrayBuffer);
					};
				});
				reader.readAsArrayBuffer(files.files[0]);
				toUpload = (await promise) as ArrayBuffer;
				//reader.readAsDataURL(files.files[0]);
				//toUpload = (await promise) as string;
				//console.debug('file dropped : ' + toUpload);
			}
		}
		console.debug('file dropped : ' + droppedFileName);
	}

	function buildMedia(): Media {
		let newMedia: Media = new Media();
		if (fType != undefined) {
			if (fType.startsWith('audio')) {
				newMedia = new AudioVideoMedia();
			} else if (fType.startsWith('video')) {
				newMedia = new AudioVideoMedia();
			} else {
				newMedia = new ScoreMedia();
			}
			newMedia.url = droppedFileName;
			// newMedia.dropped = toUpload as string;
		} else {
			try {
				new URL(url);
			} catch (_) {
				urlError = true;
				return newMedia;
			}
			newMedia.url = url;
			newMedia.droppedContent = toUpload;
		}
		newMedia.title = tuneDescription;

		return newMedia;
	}

	const delay = (ms) => new Promise((res) => setTimeout(res, ms));

	async function addMedia() {
		debugger;
		urlError = false;
		let newMedia: Media = buildMedia();
		newMedia.action = MediaAction.Add;
		card.operation = DbOperation.UPDATE;
		card.element.m = newMedia;
		card.element.f = droppedFiles;
		card.isMediaUpdate = true;
		await updater_doUpdate();
		// Little delay to let the file be written on server
		// if not set => error 404 on file access
		await delay(500); // populate to medias
		newMedia.checkUrl();
		if (newMedia.isScore) {
			medias.addScore(newMedia as ScoreMedia);
		} else if (newMedia.isAudio) {
			medias.addAudio(newMedia as AudioVideoMedia);
		} else {
			medias.addVideo(newMedia as AudioVideoMedia);
		}
		addOnExisting = false;
	}

	function addContent() {
		console.log('add content here ...');
		addOnExisting = !addOnExisting;
	}

	async function deleteContent(media: Media) {
		console.log('delete media here ...');
		urlError = false;
		let newMedia: Media = buildMedia();
		newMedia.action = MediaAction.Delete;
		newMedia.oid = media.oid;
		newMedia.title = media.title;
		newMedia.url = media.url;
		card.operation = DbOperation.UPDATE;
		card.element.m = newMedia;
		card.isMediaUpdate = true;
		await updater_doUpdate();
	}

	async function deleteScore(score: ScoreMedia) {
		await deleteContent(score);
		medias.deleteScore(score);
		// update card accordingly
		card.element.m.scores = medias.curScores;
	}

	async function deleteAudio(audio: AudioVideoMedia) {
		await deleteContent(audio);
		medias.deleteAudio(audio);
		// update card accordingly
		card.element.m.audios = medias.curAudios;
	}

	async function deleteVideo(video: AudioVideoMedia) {
		await deleteContent(video);
		medias.deleteVideo(video);
		// update card accordingly
		card.element.m.videos = medias.curVideos;
	}
</script>

<AbcDbUpdater bind:doUpdate={updater_doUpdate} {card} />

<div class="grid grid-cols-1 grid-rows-1">
	{#if medias.isEmpty || addOnExisting}
		<AbcFileUploadPanel
			meta="Audio and Video files (MP3,MP4...)"
			filesDropped={dropChangeHandler}
		/>
		<input
			class="input"
			name="description"
			title="Imedia content description "
			placeholder="media content description here"
			bind:value={tuneDescription}
		/>
		{#if !isScore}
			<input
				class="input"
				class:text-error-500={urlError}
				name="url"
				title="Input (url)"
				placeholder="http://yoursite/audiovideo.mp3 (audio or video url)"
				bind:value={url}
			/>
		{/if}
		<div class="flex flex-row justify-center p-8">
			{#if addOnExisting}
				<button type="button" class="btn preset-filled px-2 mr-2" onclick={addContent}
					>Cancel</button
				>
			{/if}

			<button
				type="submit"
				disabled={addMediaDisabled}
				class="btn preset-filled px-2"
				onclick={addMedia}>Add media</button
			>
		</div>
	{:else if isScore}
		{#each medias.curScores as score, i}
			<ul class="list">
				<li>
					<AbcMediaViewer {score} deleteElement={() => deleteScore(score)} />
				</li>
			</ul>
		{/each}
	{:else}
		{#each medias.curVideos as video, i}
			<ul class="list">
				<li>
					<AbcMediaViewer {video} deleteElement={() => deleteVideo(video)} />
				</li>
			</ul>
		{/each}
		{#each medias.curAudios as audio, i}
			<ul class="list">
				<li>
					<AbcMediaViewer {audio} deleteElement={() => deleteAudio(audio)} />
				</li>
			</ul>
		{/each}
	{/if}
	{#if $isAdmin}
		{#if medias.hasContent && !addOnExisting}
			<div class="row flex px-4">
				<button
					type="button"
					class="my-1 chip preset-tonal hover:preset-filled"
					onclick={addContent}
				>
					<span>
						<Icon icon="si:add-fill" height="1em" width="1em" />
					</span>
					<span>{addLabel}</span>
				</button>
			</div>
		{/if}
	{/if}
</div>
