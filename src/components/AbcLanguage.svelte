<script lang="ts">
  import { Combobox } from '@skeletonlabs/skeleton-svelte';
	import { onMount } from 'svelte';
	import { _, locale, locales } from 'svelte-i18n';

  interface ComboboxData {
    label: string;
    value: string;
    emoji: string;
  }

  const comboboxData: ComboboxData[] = [
    { label: 'English', value: 'lang.En', emoji: '🇬🇧' },
    { label: 'Francais', value: 'Lang.Fr', emoji: '🇫🇷' },
  ];

  let selectedLanguage = $state([comboboxData[0].value]);

  onMount(() => {
		console.log('AbcLanguage mounted => check locales : ', $locales);
	});

</script>

<Combobox
  data={comboboxData}
  value={selectedLanguage}
  onValueChange={(e) => (selectedLanguage = e.value)}
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