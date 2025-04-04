<script lang="ts">
	import { AbcFile } from '$src/data/ABCData';
	import AbcJsPanel from '$components/AbcJsPanel.svelte';
	import AbcCommentsMarkIt from '$src/components/AbcCommentsMarkIt.svelte';
	import AbcMediasPanel from './AbcMediasPanel.svelte';
	import { AbcMedias } from '$src/data/AbcMedias';

	import { onMount } from 'svelte';
	import OpenCloseView from './OpenCloseView.svelte';
	let { card } = $props();

	let hasABC: boolean = $state(false);
	let abcOpened: boolean = $state(false);
	let hasComments: boolean = $state(false);
	let commentsOpened: boolean = $state(false);
	let hasScores: boolean = $state(false);
	let scoresOpened: boolean = $state(false);
	let hasAudiosVideos: boolean = $state(false);
	let audiosVideosOpened: boolean = $state(false);

	function getFile(): AbcFile | undefined {
		if (card.element.e instanceof AbcFile) {
			return card.element.e as AbcFile;
		}
		return undefined;
	}

	function checkABC() {
		hasABC = false;
		const f = getFile();
		if (f && f.infos.contents?.abc) {
			hasABC = true;
		}
	}

	function checkComments() {
		hasComments = false;
		const f = getFile();
		if (f?.infos.comments != undefined) {
			hasComments = true;
		}
	}

	function checkScores() {
		hasScores = false;
		const medias = new AbcMedias(card, true);
		if (medias != undefined) {
			hasScores = medias.hasScores;
		}
	}

	function checkAudiosVideos() {
		hasAudiosVideos = false;
		const medias = new AbcMedias(card, false);
		if (!medias != undefined) {
			hasAudiosVideos = medias.hasAudiosVideos;
		}
	}

	onMount(() => {
		checkABC();
		checkComments();
		checkScores();
		checkAudiosVideos();
		if (hasComments) {
			commentsOpened = true;
		}
		if (hasABC) {
			abcOpened = true;
		} else {
			scoresOpened = true;
		}
	});

	function toggleOpenClose(id: string) {
		switch (id) {
			case 'abc':
				abcOpened = !abcOpened;
				break;
			case 'comments':
				commentsOpened = !commentsOpened;
				break;
			case 'medias':
				audiosVideosOpened = !audiosVideosOpened;
				break;
			case 'scores':
				scoresOpened = !scoresOpened;
				break;
		}
	}
</script>

<div class="flex flex-col">
	{#if hasComments}
		<div class="flex-none">
			<OpenCloseView id={'comments'} opened={commentsOpened} {toggleOpenClose} />
		</div>
		{#if commentsOpened}
			<AbcCommentsMarkIt scoreInfos={card.comments} />
		{/if}
	{/if}
	{#if hasABC}
		<div class="flex-none">
			<OpenCloseView id={'abc'} opened={abcOpened} {toggleOpenClose} />
		</div>
		{#if abcOpened}
			<AbcJsPanel {card} />
		{/if}
	{/if}
	{#if hasScores}
		<div class="flex-none">
			<OpenCloseView id={'scores'} opened={scoresOpened} {toggleOpenClose} />
		</div>
		{#if scoresOpened}
			<AbcMediasPanel {card} isScore={true} />
		{/if}
	{/if}
	{#if hasAudiosVideos}
		<div class="flex-none">
			<OpenCloseView id={'medias'} opened={audiosVideosOpened} {toggleOpenClose} />
		</div>
		{#if audiosVideosOpened}
			<AbcMediasPanel {card} isScore={false} />
		{/if}
	{/if}
</div>
