<script lang="ts">
  import Icon from '@iconify/svelte';
  import { goto } from '$app/navigation';

  import { AppBar } from '@skeletonlabs/skeleton-svelte';
  import DarkModeSwitcher from './DarkModeSwitcher.svelte';
  import AbcLanguage from './AbcLanguage.svelte';
</script>

<AppBar border="rounded-2xl">
  {#snippet lead()}
    <button
    class="button font-semibold text-sm md:text-xl italic text-primary-800 uppercase cursor-pointer"
    on:click={() => goto('/', { replaceState: false })}>AbcMusicStudio</button>
    <AbcLanguage />
  {/snippet}
  {#snippet trail()}
    <Icon icon="mdi:paperclip" />
    <Icon icon="solar:calendar" />
    <DarkModeSwitcher />
  {/snippet}
  <span>Title</span>
</AppBar>