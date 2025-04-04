<script lang="ts">
	import Icon from '@iconify/svelte';
	import { createEventDispatcher } from 'svelte';
	import { FileFolderCard } from '$src/data/AbcDataDisplay';
	import AbcDbUpdater from '$src/components/AbcDbUpdater.svelte';
	import { AbcFolder, AbcFile, DbOperation, Leaf } from '$src/data/ABCData';
	import { abcStore } from '$src/store';

	let { isAdmin } = abcStore;

	export let scoreLineClass: string = '';
	export let card: FileFolderCard;

	const dispatch = createEventDispatcher();

	$: curTitle = card.element.d.text;

	let newTitle = curTitle;
	let showInput = false;

	async function titleClicked(e) {
		debugger;
		console.log('title clicked');
		if (showInput) {
			curTitle = newTitle;
			if (card.element.e instanceof AbcFolder) {
				let fo = card.element.e as AbcFolder;
				fo.infos.title = curTitle;
			} else if (card.element.e instanceof AbcFile) {
				let fi = card.element.e as AbcFile;
				fi.infos.title = curTitle;
			}
			card.operation = DbOperation.UPDATE;
			await updater_doUpdate(event);
		} else {
			newTitle = curTitle;
		}
		showInput = !showInput;
	}

	function canceClicked(e) {
		showInput = false;
	}

	let updater_doUpdate;
</script>

<AbcDbUpdater bind:doUpdate={updater_doUpdate} {card} />

{#if showInput}
	<input type="text" bind:value={newTitle} />
{/if}

<h1 class={scoreLineClass}>
	{curTitle}
	{#if !card.element.isBack}
		{#if !showInput}
			{#if $isAdmin}
				<button on:click={titleClicked}>
					<Icon icon="iconamoon:pen" height="0.5em" width="0.5em" />
				</button>
			{/if}
		{:else}
			<button on:click={titleClicked}>
				<Icon icon="flat-color-icons:ok" height="0.5em" width="0.5em" />
			</button>
			<button on:click={canceClicked}>
				<Icon icon="icons8:cancel" style="color: red" height="0.5em" width="0.5em" />
			</button>
		{/if}
	{/if}
</h1>
