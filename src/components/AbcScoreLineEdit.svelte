<!-- svelte-ignore non_reactive_update -->
<!--
  Action buttons for score element
-->

<script lang="ts">
	import Icon from '@iconify/svelte';
	import newScoreImg from '$lib/assets/music.svg';
	import AbcNewScoreCardMenu from './AbcNewScoreCardMenu.svelte';
	import { AbcFolder, AbcFile, DataContent, DbOperation } from '$src/data/ABCData';
	import { FileFolderCard } from '$src/data/AbcDataDisplay';
	import AbcDbUpdater from '$src/components/AbcDbUpdater.svelte';

	let { card, scoreUpdated } = $props();

	let candidate = card.element.e;
	let index = card.index;

	async function newElement(event) {
		console.log('create new element here ...');
		card.isOpen = false; // close before creting
		card.operation = DbOperation.ADD;
		let candidate = event.detail.candidate;
		if (candidate instanceof AbcFile) {
			candidate.infos.contents = new DataContent();
			const abc = card.getdefaultAbc(candidate.infos.title);
			let encodedAbc = btoa(abc);
			candidate.infos.contents.abc = encodedAbc;
		}
		candidate.pOid = candidate.parent!.oid;
		card.element.e = candidate;
		await updater_doUpdate(event);
		scoreUpdated();
	}

	async function deleteCurrent(event) {
		console.log('delete current element ... ');
		card.operation = DbOperation.DELETE;
		await updater_doUpdate(event);
		scoreUpdated();
	}

	function isFolder(): boolean {
		let fo = candidate as AbcFolder;
		if (fo.files) {
			return true;
		}
		return false;
	}

	function buildTuneBook() {}

	let updater_doUpdate: any = $state();
</script>

<!-- Updating Form for markdown infos-->
<AbcDbUpdater bind:doUpdate={updater_doUpdate} {card} />

<div class="flex">
	{#if isFolder()}
		<button
			type="button"
			title="Build tunebook"
			onclick={buildTuneBook}
			class="btn-icon btn-icon-sm preset-filled"
		>
			<Icon width="1.5em" height="1.5em" icon="ph:books" />
		</button>
	{/if}

	<AbcNewScoreCardMenu
		buttonLabel="ScorePanel-{index}"
		image={newScoreImg}
		useIcon="ic:baseline-plus"
		{candidate}
		on:create-element={newElement}
	/>

	<button type="button" class="btn-icon btn-icon-sm preset-filled" onclick={deleteCurrent}>
		<Icon width="1.5em" height="1.5em" icon="ion:trash" />
	</button>
</div>
