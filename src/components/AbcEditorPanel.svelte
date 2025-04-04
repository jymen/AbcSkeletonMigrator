<!--

  AbcSyntax editor

-->

<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { EditorView } from '@codemirror/view';
	import { EditorState, type Extension } from '@codemirror/state';
	import { basicSetup } from 'codemirror';
	import { solarizedDark } from 'cm6-theme-solarized-dark';
	import { solarizedLight } from 'cm6-theme-solarized-light';
	import { abcMusic } from 'codemirror-lang-abcmusic';

	const dispatch = createEventDispatcher();
	const EVENT_NAME = 'AbcSource-changed';

	let ls: Storage | undefined = undefined;
	let myInput;

	export let maxHeight: string = '100%';
	export let source: string = 'console.log("hello, world")';

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
		let theme = getCodemirrorTheme();
		// handle component heights
		myInput.style.minHeight = maxHeight;
		myInput.style.maxHeight = maxHeight;
		new EditorView({
			state: EditorState.create({
				doc: source,
				extensions: [
					basicSetup,
					abcMusic(),
					theme,
					EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							console.log('text 1 updated');
							let newText = update.state.doc.toString();
							dispatch(EVENT_NAME, {
								newSource: newText
							});
							console.log(newText);
						}
					})
				]
			}),
			parent: myInput
		});
	});
</script>

<div>
	<div
		style="max-height:{maxHeight} min-height:{maxHeight}"
		bind:this={myInput}
		class="cm-wrap cm-scroller cm-content cm-gutter"
	></div>
</div>

<style>
	.cm-wrap {
		height: 100%;
	}
	.cm-scroller {
		overflow: auto;
	}
</style>
