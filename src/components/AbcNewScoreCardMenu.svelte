<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	import { Popover } from '@skeletonlabs/skeleton-svelte';

	import Icon from '@iconify/svelte';
	import AbcNewScorePanel from './AbcNewScorePanel.svelte';
	import { Leaf, AbcFolder, AbcFile } from '$data/ABCData';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let {
		buttonLabel = 'label',
		image = 'none',
		panelLabel = undefined,
		candidate,
		useIcon
	} = $props();

	/*
	export let buttonLabel: string = 'label';
	export let image: string = 'none';
	export let panelLabel: string | undefined = undefined;
	export let candidate: AbcFolder | AbcFile;
  */

	// special tablature data
	//export let useIcon: string;

	let openState = $state(false);

	function addScore(event) {
		console.log('candidate NewScoreCard :', candidate.infos.title);
		let newElement: AbcFile | AbcFolder | undefined = undefined;
		// candidate is the GUI parent here and can be a file or a folder
		// new directory
		let parent: AbcFile | AbcFolder = event.detail.parent;
		let l = new Leaf(event.detail.name);
		let today = new Date().getTime();
		l.creation = today;
		let isFolder = false;
		if (event.detail.isDirectory) {
			isFolder = true;
			newElement = new AbcFolder(l, parent.parent!);
		} else {
			// new Score
			newElement = new AbcFile(l, parent.parent!);
		}

		dispatch('create-element', {
			isDirectory: isFolder,
			parent: candidate,
			candidate: newElement
		});
	}
</script>

<div class="px-1">
	<Popover
		open={openState}
		onOpenChange={(e) => (openState = e.open)}
		positioning={{ placement: 'bottom' }}
		triggerBase="btn preset-tonal"
		contentBase="card  bg-surface-100 dark:bg-surface-800 p-4 space-y-4 max-w-[320px]"
		arrow
		arrowBackground="!bg-surface-200 dark:!bg-surface-500"
	>
		{#snippet trigger()}
			<span>
				<Icon height="1.75em" width="1.75em" icon={useIcon} />
			</span>
		{/snippet}
		{#snippet content()}
			<article>
				<div class="card p-4 z-50 preset-filled-primary-500" data-popup={buttonLabel}>
					<header class="card-header flex justify-center">
						<Avatar name="filtered" src={image} classes="w-16" />
					</header>
					<section class="py-2">
						{#if panelLabel != undefined}
							<p class="opacity-50 px-1 py-2">{panelLabel}</p>
						{/if}
						<AbcNewScorePanel parent={candidate} on:add-element={addScore} />
					</section>

					<div class="arrow preset-filled-primary-500"></div>
				</div>
			</article>
		{/snippet}
	</Popover>
</div>
