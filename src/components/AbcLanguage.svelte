<script lang="ts">
  import { Combobox } from '@skeletonlabs/skeleton-svelte';
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { _, locale, locales } from 'svelte-i18n';

  interface ComboboxData {
    label: string;
    value: string;
    emoji: string;
  }

  const comboboxData: ComboboxData[] = [
    { label: 'English', value: 'En', emoji: '🇬🇧' },
    { label: 'Francais', value: 'FR', emoji: '🇫🇷' },
  ];

  let selectedCountry = $state(['US']);

  onMount(() => {
		console.log('AbcLanguage mounted => check locales : ', $locales);
	});

</script>

<Combobox
  data={comboboxData}
  value={selectedCountry}
  onValueChange={(e) => (selectedCountry = e.value)}
  placeholder="Language..."
>
  <!-- This is optional. Combobox will render label by default -->
  {#snippet item(item)}
    <div class="flex w-full justify-between space-x-2">
      <span>{item.label}</span>
      <span>{item.emoji}</span>
    </div>
  {/snippet}
</Combobox>