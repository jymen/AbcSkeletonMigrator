<script lang="ts">
	import { Combobox } from '@skeletonlabs/skeleton-svelte';
	import { onMount } from 'svelte';
	import { _, locale, locales } from 'svelte-i18n';

	interface IComboboxData {
		label: string;
		value: string;
		emoji: string;
	}

	const comboboxData: IComboboxData[] = [
		{ label: 'English', value: 'en', emoji: '🇺🇸' },
		{ label: 'Français', value: 'fr', emoji: '🇫🇷' }
	];

	let selectedLanguage = $state([$locale!]);
	let placeholder: string = $state('Language...');
	// let selectedLanguage = $state([$locale!]);"

	onMount(() => {
		console.log('AbcLanguage mounted => check locales : ', $locales);
		console.log(' => check locale : ', $locale);
		selectedLanguage = [$locale!];
		if ($locale != undefined) {
			selectedLanguage = [$locale!];
			for (let i = 0; i < comboboxData.length; i++) {
				if (comboboxData[i].value == $locale) {
					placeholder = comboboxData[i].label;
					break;
				}
			}
		}
	});

	function languageChanged(e: any) {
		console.log('Language changed to : ', e.value);
		selectedLanguage = e.value;
		$locale = e.value[0];
	}

	$effect(() => {
		console.log('AbcLanguage effect => check locales : ', $locales);
		console.log(' => check locale : ', $locale);
		selectedLanguage = [$locale!];
	});
</script>

<Combobox
	data={comboboxData}
	value={selectedLanguage}
	onValueChange={languageChanged}
	contentBackground="bg-surface-200 dark:bg-surface-700"
	optionActive="bg-surface-100 dark:bg-surface-500"
	positionerBase="border rounded-lg border-primary-200 dark:border-surface-200"
	{placeholder}
>
	<!-- This is optional. Combobox will render label by default -->
	{#snippet item(item)}
		<div class="flex w-full justify-between space-x-2">
			<span>{item.label}</span>
			<span>{item.emoji}</span>
		</div>
	{/snippet}
</Combobox>
