<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	import { basicSetup, EditorView } from 'codemirror';

	import { languages } from '@codemirror/language-data';
	import { markdown } from '@codemirror/lang-markdown';
	import { solarizedDark } from 'cm6-theme-solarized-dark';
	import { solarizedLight } from 'cm6-theme-solarized-light';
	import type { Extension } from '@codemirror/state';

	const dispatch = createEventDispatcher();
	const EVENT_NAME = 'MarkdownSource-changed';

	// The Markdown parser will dynamically load parsers
	// for code blocks, using @codemirror/language-data to
	// look up the appropriate dynamic import.
	let parent;
	let ls: Storage | undefined = undefined;

	export let content: string = "Hello\n\n```javascript\nlet x = 'y'\n```";

	function isDark(): boolean {
		if (
			document.documentElement.className === 'dark' ||
			(!('theme' in ls!) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			return true;
		}
		return false;
	}

	function getCodemirrorTheme(): Extension {
		// get infos about dark mode
		typeof localStorage !== `undefined` && (ls = localStorage);
		let theme = solarizedLight;
		if (isDark()) {
			console.log('dark mode is enabled');
			theme = solarizedDark;
		}
		return theme;
	}

	onMount(() => {
		// get infos about dark mode
		let theme = getCodemirrorTheme();
		new EditorView({
			doc: content,
			extensions: [
				basicSetup,
				markdown({ codeLanguages: languages }),
				theme,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						console.log('Markdown source updated');
						let newText = update.state.doc.toString();
						dispatch(EVENT_NAME, {
							newSource: newText
						});
						console.log(newText);
					}
				})
			],
			parent: parent
		});
	});
</script>

<section bind:this={parent}></section>

<style>
</style>
