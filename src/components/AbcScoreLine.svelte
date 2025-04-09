<!--
  Single repository line copyright component
-->

<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	import { AbcFolder, AbcFile, DbOperation } from '$src/data/ABCData';
	import { FileFolderCard } from '$src/data/AbcDataDisplay';
	import { abcStore } from '$src/store';
	import { _ } from 'svelte-i18n';
	import AbcScoreLineEdit from './AbcScoreLineEdit.svelte';
	import { createEventDispatcher } from 'svelte';
	import AbcScoreLineComplementaryHeader from './AbcScoreLineComplementaryHeader.svelte';
	import AbcScoreTitle from '$src/components/AbcScoreTitle.svelte';
	import AbcTabPanel from './AbcTabPanel.svelte';
	import AbcScoreLineView from './AbcScoreLineView.svelte';
	import AbcDbUpdater from '$src/components/AbcDbUpdater.svelte';

	// import i18next from 'i18next';

	const dispatch = createEventDispatcher();

	let { currentRoot, scoreContext, isAdmin } = abcStore;
	//let scoreHasBeenUpdated = false;

	export let card: FileFolderCard;

	let tabSet: number = 0;
	// $: isOpen = card.isOpen;
	$: scoreLineClass = 'font-bold h6';

	function doFileClose() {
		if (card.isOpen) {
			scoreLineClass = 'font-bold h8';
		} else {
			scoreLineClass = 'font-bold h6';
		}
	}

	function setScoreContext() {
		let oid = card.element.e.oid.oid;
		let curScoreContext = $scoreContext.getContext(oid);
		if (curScoreContext == undefined) {
			$scoreContext.addContext(oid);
		}
	}

	function handleClick(event) {
		card.isOpen = !card.isOpen;
		if (card.isOpen) {
			console.log('card open : ', card.index);
			if (card.isFile) {
				setScoreContext();
			}
		}
		if (card.isFile) doFileClose();
		if (card.element.e instanceof AbcFolder) {
			let fo = card.element.e as AbcFolder;
			// Check for back
			if (card.element.isBack) {
				$currentRoot = fo.parent!;
			} else {
				$currentRoot = fo; // populate new root
			}
		}
	}

	// score personal infos have been updated
	/*
	function markdownUpdated(event) {
		console.log('markdown has been updated');
		updateRepo(undefined, card.encode(event.detail.markdown));
	}
		*/

	function checkAbcFile(): AbcFile | undefined {
		if (card.element.e instanceof AbcFile) {
			return card.element.e as AbcFile;
		}
		return undefined;
	}

	/*
	function checkAbcFolder(): AbcFolder | undefined {
		if (card.element.e instanceof AbcFolder) {
			return card.element.e as AbcFolder;
		}
		return undefined;
	}



	function addMedia(event) {
		console.log('adding media AbcScoreLine ...');
		let fi: AbcFile | undefined = checkAbcFile();
		const curMedia = event.detail.media;
		curMedia.action = DbOperation.ADD;
		if (fi != undefined) {
			dispatch('media-action', {
				media: curMedia,
				files: event.detail.files,
				e: fi
			});
		}
	}
  */

	let updater_doUpdate;

	function scoreUpdated() {}
</script>

<div class="card w-full hover:shadow-2xl overflow-hidden">
	<!-- Updating Form for markdown infos-->
	<AbcDbUpdater bind:doUpdate={updater_doUpdate} {card} />

	<header class="p-1 flex justify-start items-center space-x-4">
		<button
			type="button"
			on:click={handleClick}
			class="btn-icon btn-icon-sm &>*]:pointer-events-none"
		>
			<span>
				<Avatar
					classes="cursor-pointer"
					name="icon"
					background="bg-transparent"
					rounded="rounded-none"
					size="w-10 h-10"
				>
					<img alt="Score Line Icon" src={card.element.d.image} width={card.element.d.width} />
				</Avatar>
			</span>
		</button>
		<div class="flex-auto flex justify-between items-center">
			<AbcScoreTitle {scoreLineClass} {card} />
			{#if card.isOpen}
				{#if $isAdmin}
					<AbcScoreLineComplementaryHeader scoreDate={new Date(card.element.e.infos.creation)} />
				{/if}
			{/if}
			{#if $isAdmin}
				<AbcScoreLineEdit {card} {scoreUpdated} />
			{:else}
				<div class="flex"></div>
			{/if}
		</div>
	</header>

	{#if card.canExpand}
		<section class="p-1">
			<footer class="card-footer">
				{#if $isAdmin}
					<AbcTabPanel {card} />
				{:else if card.isOpen}
					<AbcScoreLineView {card} />
				{/if}
			</footer>
		</section>
	{/if}
</div>
