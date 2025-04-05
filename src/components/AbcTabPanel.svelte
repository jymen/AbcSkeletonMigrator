<script lang="ts">
	import AbcJsPanel from '$components/AbcJsPanel.svelte';
	import AbcCommentsMarkIt from '$src/components/AbcCommentsMarkIt.svelte';

	import { onMount } from 'svelte';
	import AbcMediasPanel from './AbcMediasPanel.svelte';
	import AbcDbUpdater from '$src/components/AbcDbUpdater.svelte';
	import { AbcFile, DbOperation } from '$src/data/ABCData';

	const ABC = 0;
	const INFOS = 1;
	const SOUNDS = 2;
	const IMAGES = 3;
	const TOOLS = 4;

	let tabAbc: HTMLButtonElement;
	let tabInfos: HTMLButtonElement;
	let tabSound: HTMLButtonElement;
	let tabImages: HTMLButtonElement;
	let tabTools: HTMLButtonElement;

	let selected = $state(ABC);
	// make binded components initted
	//$: console.log(tabAbc, tabInfos, tabSound, tabImages, tabTools);
	let selectedButton = $state(new HTMLButtonElement());

	let { card } = $props();

	onMount(() => {
		console.log(`tabPanel mounted `);
	});

	function toggleSelection(newSel: HTMLButtonElement) {
		selectedButton.classList.remove('selected');
		selectedButton.classList.add('preset-tonal');
		selectedButton = newSel;
		selectedButton.classList.remove('preset-tonal');
		selectedButton.classList.add('selected');
	}

	function abcClicked() {
		console.log(`abcClicked entered `);
		selected = ABC;
		toggleSelection(tabAbc);
	}

	function infoClicked(event) {
		console.log(`infosClicked entered `);
		selected = INFOS;
		toggleSelection(tabInfos);
	}

	function setMedia() {
		const curFile = card.element.e as AbcFile;
		const curMedia = curFile.infos.contents?.medias;
		card.element.m = curMedia;
	}

	function soundClicked(event) {
		console.log(`soundClicked entered `);
		selected = SOUNDS;
		toggleSelection(tabSound);
		setMedia();
	}

	function imageClicked(event) {
		console.log(`imagesClicked entered `);
		selected = IMAGES;
		toggleSelection(tabImages);
		setMedia();
	}
	function toolsClicked(event) {
		console.log(`tools click entered `);
		selected = TOOLS;
		toggleSelection(tabTools);
	}

	async function scoreUpdated(event) {
		if (event.detail == undefined) return;
		console.log('score has been updated');
		// updateRepo(card.encode(event.detail.source));
		card.updateFile(event.detail.source, undefined);
		card.operation = DbOperation.UPDATE;
		card.isMediaUpdate = true;
		await updater_doUpdate(event);
	}

	async function markdownUpdated(text: string) {
		if (text == undefined) return;
		console.log('markdown has been updated');
		// updateRepo(card.encode(event.detail.source));
		card.updateFile(undefined, text);
		card.operation = DbOperation.UPDATE;
		card.isMediaUpdate = false;
		await updater_doUpdate(text);
	}

	let updater_doUpdate: any = $state();
</script>

<!--
 Tab Panel utility 
-->
<!-- Tab links -->
<div class="tab">
	<button class="tablinks btn selected" bind:this={tabAbc} onclick={abcClicked}>Abc</button>
	<button class="tablinks btn preset-tonal" bind:this={tabInfos} onclick={infoClicked}>Infos</button
	>
	<button class="tablinks btn preset-tonal" bind:this={tabSound} onclick={soundClicked}
		>Recordings</button
	>
	<button class="tablinks btn preset-tonal" bind:this={tabImages} onclick={imageClicked}
		>Scores</button
	>
	<button class="tablinks btn preset-tonal" bind:this={tabTools} onclick={toolsClicked}
		>Tools</button
	>
</div>
<!-- Tab content -->
{#if selected == ABC}
	<div class="grid grid-cols-1 grid-rows-1">
		<AbcJsPanel {card} on:score-changed={scoreUpdated} />
	</div>
	<!-- Updating Form for markdown infos-->
	<AbcDbUpdater bind:doUpdate={updater_doUpdate} {card} />
{/if}
{#if selected == INFOS}
	<div class="grid grid-cols-1 grid-rows-1">
		<AbcCommentsMarkIt markdownHasUpdated={markdownUpdated} scoreInfos={card.comments} />
	</div>
	<!-- Updating Form for markdown infos-->
	<AbcDbUpdater bind:doUpdate={updater_doUpdate} {card} />
{/if}
{#if selected == SOUNDS}
	<AbcMediasPanel {card} isScore={false} {updater_doUpdate} />
{/if}
{#if selected == IMAGES}
	<AbcMediasPanel {card} isScore={true} {updater_doUpdate} />
{/if}
{#if selected == TOOLS}
	<div class="grid grid-cols-1 grid-rows-1">(tab panel 4 contents)</div>
{/if}

<style lang="postcss">
	.selected {
	}
	/* Style the tab */
	.tab {
	}
</style>
