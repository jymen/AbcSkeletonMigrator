<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	import { Popover } from '@skeletonlabs/skeleton-svelte';
	import AbcTablaturePanel from './AbcTablaturePanel.svelte';
	import { type Snippet } from 'svelte';

	// tablature and oid are used for tablature only
	let {
		buttonLabel = 'label',
		image = 'non',
		panelLabel = undefined,
		tablature = false,
		oid = undefined,
		children: Snippet
	} = $props();

	let openState = $state(false);

	/*
	let popupFeatured: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'click',
		// Matches the data-popup value on your popup element
		target: buttonLabel,
		// Defines which side of your trigger the popup will appear
		placement: 'bottom'
	};
  */

	function popoverClose() {
		openState = false;
	}
</script>

<Popover
	open={openState}
	onOpenChange={(e) => (openState = e.open)}
	positioning={{ placement: 'top' }}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-200-800 p-4 space-y-4 max-w-[320px]"
	arrow
	arrowBackground="!bg-surface-200 dark:!bg-surface-800"
>
	{#snippet trigger()}Click Me{/snippet}
	{#snippet content()}
		<header class="flex justify-between">
			<p class="font-bold text-xl">Popover Example</p>
			<button class="btn-icon hover:preset-tonal" onclick={popoverClose}>{buttonLabel}</button>
		</header>
		<article>
			<div class="card p-4 z-50 preset-filled-primary-500" data-popup={buttonLabel}>
				<header class="card-header flex justify-center">
					<Avatar name="" src={image} classes="w-16" />
				</header>
				<section class="py-2">
					{#if panelLabel != undefined}
						<p class="opacity-50 px-1 py-2">{panelLabel}</p>
					{/if}
					{#if tablature}
						<AbcTablaturePanel {oid} />
					{/if}
					<slot />
				</section>

				<div class="arrow preset-filled-primary-500"></div>
			</div>
		</article>
	{/snippet}
</Popover>
