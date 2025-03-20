<script lang="ts">
	import Icon from '@iconify/svelte';
	//. import Timeline from '$lib/Timeline/Timeline.svelte';
	import { AbcMessageHandler } from '$utils/AbcMessageHandler';
	import { messageHandler, abcMessage } from '$src/store';
	import AbcTools from '$src/components/AbcTools.svelte';

	import { Popover } from '@skeletonlabs/skeleton-svelte';
	import AbcTextIcon from './AbcTextIcon.svelte';
	import AbcImport from './AbcImport.svelte';
	import AbcHelp from './AbcHelp.svelte';

	// let currentLanguage = 'English';
  let openState = $state(false);

	function messageSelected(event) {
		console.log('message selected : ');
		const h = new AbcMessageHandler($messageHandler.visible, $messageHandler.fadeTimer);
		h.switchMessage();
		messageHandler.set(h);
	}
</script>

<Popover

  open={openState}
  onOpenChange={(e) => (openState = e.open)}
  positioning={{ placement: 'bottom' }}
  triggerBase="btn preset-tonal"
  contentBase="card bg-surface-100 dark:bg-surface-800 p-4 space-y-4 max-w-[320px]"
  arrow
  arrowBackground="!bg-surface-200 dark:!bg-surface-800"
>
  {#snippet trigger()}
	  <span>
		  <Icon width="2em" height="2em" icon="iconamoon:menu-burger-horizontal" />
	  </span>
	{/snippet}
  {#snippet content()}
    <header class="flex justify-between">
    </header>
    <article>
			<div class="rounded-lg hover:bg-surface-200/70">
				<AbcImport text="Import" />
			</div>
			<div class="rounded-lg hover:bg-surface-200/70">
				<AbcTools text="Abc tools" />
			</div>
			<div class="rounded-lg hover:bg-surface-200/70">
				<button class="listbox-item" onclick={messageSelected}>
					<AbcTextIcon text="show last message" icon="ep:warning" />
				</button>
			</div>
			<div class="rounded-lg hover:bg-surface-200/70">
				<AbcHelp text="help" />
			</div>
		</article>
  {/snippet}
</Popover>


<style lang="postcss">
</style>
