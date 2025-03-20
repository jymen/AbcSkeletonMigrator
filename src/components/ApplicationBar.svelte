<script lang="ts">
  import Icon from '@iconify/svelte';
  import { goto } from '$app/navigation';

  import { AppBar } from '@skeletonlabs/skeleton-svelte';
  import DarkModeSwitcher from './DarkModeSwitcher.svelte';
  import AbcLanguage from './AbcLanguage.svelte';
  import AbcBurger from './AbcBurger.svelte';
  import AbcUserConnection from './AbcUserConnection.svelte';
  import AbcTogleAdmin from './AbcTogleAdmin.svelte';
  import AbcHelp from '$src/components/AbcHelp.svelte';
  import AbcImport from '$src/components/AbcImport.svelte';
  import AbcTools from '$src/components/AbcTools.svelte';     
  import AbcTextIcon from '$src/components/AbcTextIcon.svelte';
  import { messageHandler } from '$src/store';
  import { AbcMessageHandler } from '$utils/AbcMessageHandler';

  function toggleMsgHandler() {
		console.log('Togling msg handler');
		const h = new AbcMessageHandler($messageHandler.visible, $messageHandler.fadeTimer);
		h.switchMessage();
		messageHandler.set(h);
	}


</script>
<AppBar border="rounded-2xl" classes="bg-surface-100 dark:bg-surface-500">
  {#snippet lead()}
    <button
    class="button font-semibold text-sm md:text-xl italic text-primary-800 uppercase cursor-pointer"
    on:click={() => goto('/', { replaceState: false })}>AbcMusicStudio</button>
    <AbcLanguage />
    <AbcUserConnection />
  {/snippet}
  {#snippet trail()}
  <div class="flex space-x-2 max-md:hidden">
      <AbcImport />
      <AbcTools />
      <button type="button" on:click={toggleMsgHandler} class="btn-icon preset-filled bg-surface-200/40">
        <AbcTextIcon icon="ep:warning" />
      </button>
      <AbcHelp />
  </div>
  <AbcTogleAdmin />
  <DarkModeSwitcher />
  <div class="md:hidden">
    <AbcBurger  />
  </div>
  {/snippet}
</AppBar>
