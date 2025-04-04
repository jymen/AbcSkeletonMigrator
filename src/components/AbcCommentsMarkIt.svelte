<script lang="ts">
	import { onMount } from 'svelte';
	import AbcMarkdownEditor from './AbcMarkdownEditor.svelte';
	import Icon from '@iconify/svelte';
	import { abcStore } from '$src/store';

	//import { marked, type RendererObject, type Tokens } from 'marked';
	// import commonmark from 'commonmark';
	import Markdownit from 'markdown-it';

	let { isAdmin } = abcStore;

	const md = Markdownit({
		// Enable HTML tags in source
		html: false,

		// Use '/' to close single tags (<br />).
		// This is only for full CommonMark compatibility.
		xhtmlOut: false,

		// Convert '\n' in paragraphs into <br>
		breaks: false,

		// CSS language prefix for fenced blocks. Can be
		// useful for external highlighters.
		langPrefix: 'language-',

		// Autoconvert URL-like text to links
		linkify: false,

		// Enable some language-neutral replacement + quotes beautification
		// For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.mjs
		typographer: false,

		// Double + single quotes replacement pairs, when typographer enabled,
		// and smartquotes on. Could be either a String or an Array.
		//
		// For example, you can use '«»„“' for Russian, '„“‚‘' for German,
		// and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
		quotes: '“”‘’',

		// Highlighter function. Should return escaped HTML,
		// or '' if the source string is not changed and should be escaped externally.
		// If result starts with <pre... internal wrapper is skipped.
		highlight: function (/*str, lang*/) {
			return '';
		}
	});

	class CurItems {
		list: MarkdownListItem[] = [];

		public get currentItem() {
			if (this.list.length == 0) return undefined;
			return this.list[this.list.length - 1];
		}

		pop() {
			if (this.list.length > 0) this.list.pop();
		}

		push(item: MarkdownListItem) {
			this.list.push(item);
		}
	}

	let listCounter: number = 0;
	let curLevel: number = 0;
	let curItems: CurItems = new CurItems();
	let listItemCounter: number = 0;

	// token: List of all tokens being parsed
	// idx: Number that corresponds to the key of the current token in tokens
	// options: The options defined when creating the new markdown-it object ({} in our case)
	// env ???
	// self: A reference to the renderer itself
	const proxy = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options);

	let defaultTextRender = md.renderer.rules.text || proxy;
	md.renderer.rules.text = function (tokens, idx, options, env, self): string {
		let curToken = tokens[idx];
		console.log('Text : ', curToken.content);
		let curItem = curItems.currentItem;
		if (curItem != undefined) {
			curItem.text = curToken.content;
			return ''; // nothing else to handle here
		}
		// Pass the token to the default renderer.
		return defaultTextRender!(tokens, idx, options, env, self);
	};

	let defaultInlineRender = md.renderer.rules.inline || proxy;
	md.renderer.rules.inline = function (tokens, idx, options, env, self): string {
		console.log('Inline ');

		// Pass the token to the default renderer.
		return defaultInlineRender!(tokens, idx, options, env, self);
	};

	const defaultParagraphOpenRenderer = md.renderer.rules.paragraph_open || proxy;
	const defaultParagraphCloseRenderer = md.renderer.rules.paragraph_close || proxy;

	md.renderer.rules.bullet_list_open = function (tokens, idx, options, env, self) {
		console.log('bullet list open ', tokens[0].info);
		let curToken = tokens[idx];
		// let rendered = defaultBulletListOpenRenderer(tokens, idx, options, env, self);
		// new inProgress List
		let newList = markDownLists.newMarkdownList(curToken, curLevel);
		return newList.embed();
	};

	md.renderer.rules.bullet_list_close = function (tokens, idx, options, env, self) {
		console.log('bullet list close');
		let curToken = tokens[idx];
		// let rendered = defaultBulletListCloseRenderer(tokens, idx, options, env, self);
		let emitted = '</div>';
		if (curLevel > 0) {
			curLevel--;
		}
		markDownLists.pop();
		return emitted;
	};

	md.renderer.rules.ordered_list_open = function (tokens, idx, options, env, self) {
		console.log('Ordered list open');
		let curToken = tokens[idx];
		// embedded list case
		let newList = markDownLists.newMarkdownList(curToken, curLevel);
		listItemCounter = newList.startingNumber;
		return newList.embed();
	};

	md.renderer.rules.ordered_list_close = function (tokens, idx, options, env, self) {
		console.log('Ordered list close');
		let curToken = tokens[idx];
		// let rendered = defaultBulletListCloseRenderer(tokens, idx, options, env, self);
		let emitted = '</div>';
		curLevel--;
		return emitted;
	};

	md.renderer.rules.list_item_open = function (tokens, idx, options, env, self) {
		console.log('list item open');
		let curToken = tokens[idx];
		let curList = markDownLists.getCurrentList();
		let curItem = new MarkdownListItem(curToken, curList!.level);
		curItems.push(curItem);
		//let rendered = defaultListItemOpenRenderer(tokens, idx, options, env, self);
		//return rendered;
		return '';
	};

	md.renderer.rules.list_item_close = function (tokens, idx, options, env, self) {
		console.log('list item close');
		let curToken = tokens[idx];
		// Emit and cleanup
		let curItem = curItems.currentItem;
		let emitted = curItem!.emit(curLevel);
		curItems.pop(); // cleanup
		// let rendered = defaultListItemCloseRenderer(tokens, idx, options, env, self);
		return emitted;
	};

	md.renderer.rules.paragraph_open = function (tokens, idx, options, env, self) {
		if (curItems.currentItem != undefined) return ''; // nothing to do here
		console.log('paragraph open');
		let rendered = defaultParagraphOpenRenderer(tokens, idx, options, env, self);
		return rendered;
	};

	md.renderer.rules.paragraph_close = function (tokens, idx, options, env, self) {
		console.log('paragraph close');
		if (curItems.currentItem != undefined) {
			return ''; // nothing to do here
		}
		let rendered = defaultParagraphCloseRenderer(tokens, idx, options, env, self);
		return rendered;
	};

	function tokenTagConverter(token: any): MarkdownListType {
		let returned = MarkdownListType.ul;
		if (token.tag == 'ol') {
			returned = MarkdownListType.ol;
		}
		return returned;
	}

	class MarkIt {
		source: string;
		parsed: string | undefined = undefined;

		constructor(source: string) {
			this.source = source;
		}
		parse() {
			this.parsed = md.render(this.source);
			console.log(Object.keys(md.renderer.rules));
		}
	}

	enum MarkdownListType {
		ul,
		ol,
		item
	}

	class MarkdownListItem {
		counterLabel?: string;
		type: MarkdownListType;
		text?: string;
		embedded?: MarkdownList;
		level: number;
		emitted: boolean = false;

		constructor(token: any, level: number) {
			let parent = markDownLists.getCurrentList();
			this.type = parent!.type;
			this.level = level;
		}

		//
		// handle embedded list case here
		//
		embed(list: MarkdownList, level: number): string {
			this.embedded = list;
			list.embedded = this;
			return this.emit(level);
		}

		emit(level: number): string {
			if (this.emitted) return ''; // nothing bto do
			let html = `<div class="markdown-${level}-list">\n`;
			if (this.type == MarkdownListType.ol) {
				html += `<span class="markdown-listnumbereditem" style="margin-left:${level}em">\n`;
				html += listItemCounter;
				listItemCounter++;
				html += '</span>\n';
			} else {
				let clss = 'markdown-listitem ';
				if (level % 2 == 0) {
					clss += ' markdown-circle ';
				} else {
					clss += 'markdown-diamond ';
				}
				html += `<span class="${clss}" style="margin-left:${level}em">\n`;
			}
			html += `<span class=""> ${this.text} </span>\n`;
			html += '</div>\n';
			this.emitted = true;
			return html;
		}
	}

	class MarkdownList {
		id?: string;
		level: number;
		type: MarkdownListType;
		startingNumber: number = 1;
		embedded?: MarkdownListItem;

		constructor(token: any, id: string, level: number) {
			this.level = level;
			this.type = tokenTagConverter(token);
			if (this.type == MarkdownListType.ol) {
				let startingNumber = token.attrGet('start');
				if (startingNumber != undefined) {
					this.startingNumber = startingNumber;
				}
			}
			this.id = id;
		}

		emit(): string {
			let listClass = 'markdown-ul';
			if (this.type == MarkdownListType.ol) {
				listClass = 'markdown-ol';
			}
			let emitted = '<div id="' + this.id + '" class="' + listClass + '">';
			return emitted;
		}

		embed(): string {
			// embedded list case
			let curItem = curItems.currentItem;
			let returned = '';
			if (curItem != undefined) {
				returned = curItem.embed(this, this.level);
			}
			if (returned.length > 0) {
				curLevel++;
			}
			return returned + this.emit();
		}
	}

	class MarkdownLists {
		lists: MarkdownList[];
		curMarkdownList?: MarkdownList;
		curListPosition: number = 0;

		constructor() {
			this.lists = [];
		}

		isEmpty(): boolean {
			if (this.lists.length == 0) return true;
			return false;
		}

		newMarkdownList(token: any, level: number): MarkdownList {
			let list = new MarkdownList(token, `markdownlist-${listCounter++}`, level);
			this.lists.push(list); // New plain list
			this.curMarkdownList = list;
			return list;
		}

		getCurrentList(): MarkdownList | undefined {
			if (this.curMarkdownList != undefined) return this.curMarkdownList;
			if (this.lists.length > 0) return this.lists[this.lists.length - 1];
			return undefined;
		}

		getListAt(pos: number): MarkdownList | undefined {
			if (this.isEmpty()) return undefined;
			if (pos > this.lists.length) return undefined;
			return this.lists[pos];
		}

		pop(): MarkdownList | undefined {
			if (this.lists.length == 0) return undefined;
			return this.lists.pop();
		}
	}

	let markDownLists = new MarkdownLists();
	let markdownHasBeenChanged = false;

	/**
	 * Dynamically process mardown lists
	 */
	function markdownListProcessor() {}

	let {
		scoreInfos = `
# User Notes 


click the [Markdown](https://daringfireball.net/projects/markdown/) button above to 
Enter any suitable comments you need 

`,
		markdownHasUpdated = () => {}
	} = $props();

	let testdata = `
	* Item 1
  * Item 2
  * Item 3
    * Sub-item 3a
    * Sub-item 3b
       1. Sub-Sub-item 3a
       1. Sub-Sub-item 3b

  just a new standard line after last item list

  * Item bis 1
  * Item bis 2


	`;

	async function markedInit() {
		let parser = new MarkIt(updatedInfos);
		parser.parse();
		html = parser.parsed!;
	}

	onMount(() => {
		markedInit();
	});

	let markdownVisible = $state(false);

	function showMarkdown() {
		markdownVisible = !markdownVisible;
		if (!markdownVisible && markdownHasBeenChanged) {
			// notify for db update
			markdownHasUpdated(updatedInfos);
		}
	}

	let updatedInfos: any = $state(scoreInfos);
	let html: string = $state('<div/>');

	let sample = `
		<div class="markdown border-dotted border-2 border-primary-700 rounded-lg p-1">
			<ul>
				<li>This is a list</li>
				<li>
					With two items
					<ul></ul>
				</li>
			</ul>
		</div>
		* Item 1
* Item 2
* Item 3
  * Sub-item 3a
  * Sub-item 3b
     1. Sub-Sub-item 3a
     1. Sub-Sub-item 3b

just a new standard line after last item list

* Item bis 1
* Item bis 2


	
	`;

	function markdownUpdated(event) {
		console.log('markdown changed');
		// parse it
		updatedInfos = event.detail.newSource;
		markedInit();
		markdownHasBeenChanged = true;
	}
</script>

<div class="flex flex-col card">
	{#if $isAdmin}
		<header class="card-header px-1 flex flex-line justify-left items-center">
			<button type="button" class="btn btn-sm preset-filled" onclick={showMarkdown}>
				{#if markdownVisible}
					Save Infos
				{:else}
					<Icon icon="material-symbols-light:markdown" height="2em" width="2em" />
				{/if}
			</button>
		</header>
	{/if}

	<section class="my-2 flex-1 flex-wrap">
		<div class="markdown flex-col border-dotted border-2 border-primary-700 rounded-lg p-1">
			{@html html}
		</div>
		{#if markdownVisible}
			<section
				class="my-2 flex overflow-auto border-dotted border-2 border-primary-700 rounded-lg flex-col bg-white m-auto p-auto h-60"
			>
				<AbcMarkdownEditor content={scoreInfos} on:MarkdownSource-changed={markdownUpdated}
				></AbcMarkdownEditor>
			</section>
		{/if}
	</section>
</div>

<style lang="postcss">
	@import url(http://fonts.googleapis.com/css?family=Open+Sans:300italic,300);
	.markdown {
		@apply bg-primary-300;
	}

	:global(.markdown-listnumbereditem) {
		font-family: Arimo, Helvetica, sans-serif;
		font-size: 1rem;
		padding-right: 0.5rem;
	}

	:global(.markdown-square) {
		--icon-url: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%23000' d='M3 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z'/%3E%3C/svg%3E");
	}

	:global(.markdown-circle) {
		--icon-url: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22'/%3E%3C/svg%3E");
	}

	:global(.markdown-diamond) {
		--icon-url: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 512 512'%3E%3Cpath fill='%2359cafc' d='M245.818 231.747L142.945 128.874c-5.624-5.624-5.624-14.741 0-20.365L245.818 5.637c5.624-5.624 14.741-5.624 20.365 0L369.055 108.51c5.624 5.624 5.624 14.741 0 20.365L266.182 231.747c-5.623 5.623-14.741 5.623-20.364 0m20.364 274.616L369.055 403.49c5.624-5.624 5.624-14.741 0-20.365L266.182 280.253c-5.624-5.624-14.741-5.624-20.365 0L142.945 383.126c-5.624 5.624-5.624 14.741 0 20.365l102.873 102.873c5.623 5.623 14.741 5.623 20.364-.001m14.071-241.724l102.873 102.873c5.624 5.624 14.741 5.624 20.365 0l102.873-102.873c5.624-5.624 5.624-14.741 0-20.365L403.49 141.402c-5.624-5.624-14.741-5.624-20.365 0L280.253 244.275c-5.623 5.623-5.623 14.741 0 20.364m-274.616 0L108.51 367.512c5.624 5.624 14.741 5.624 20.365 0l102.873-102.873c5.624-5.624 5.624-14.741 0-20.365L128.874 141.402c-5.624-5.624-14.741-5.624-20.365 0L5.637 244.275c-5.624 5.623-5.624 14.741 0 20.364'/%3E%3Ccircle cx='253.538' cy='256' r='52.235' fill='%230096d1'/%3E%3C/svg%3E");
	}

	:global(.markdown-listitem::before) {
		@apply bg-surface-600;
		display: inline-block;
		vertical-align: middle;
		width: 0.5em;
		height: 0.5em;
		content: var(--icon-url);
		-webkit-mask-image: var(--icon-url);
		mask-image: var(--icon-url);
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-size: 100% 100%;
		mask-size: 100% 100%;
		padding-right: 1em;
	}

	/*
	.markdown {
		@apply preflight;
	}
		*/

	/*
	:global(body) {
		margin: 0;
		padding: 0;
	}

	.markdown {
		@apply bg-primary-300;
	}

	.markdown {
		font-size: 1em;
		color: #444;
		font-family: 'Open Sans', Helvetica, sans-serif;
		font-weight: 300;
		max-width: 48rem;
		line-height: 1.85;
	}
		*/

	/*
	.markdown :global(u) :global(*) {
		list-style-type: circle !important;
	}
	*/

	/*
	.markdown :global(ul) {
		list-style: none;
	}
	.markdown :global(ul) :global(li:before) {
		content: '✅';
		display: inline-block;
		margin-right: 0.2rem;
	}

	.markdown :global(ol) {
		list-style: none;
		counter-reset: cupcake;
		padding-left: 2em;
	}
	.markdown :global(ol) :global(li) {
		counter-increment: cupcake;
	}
	.markdown :global(ol) :global(li:before) {
		content: counters(cupcake, '.') '. ';
	}

	*/

	.markdown :global(html) {
		font-size: 18px;
		max-width: 100%;
	}
	.markdown {
		@apply bg-primary-300;
	}

	@media screen and (min-width: 32rem) and (max-width: 48rem) {
		.markdown {
			font-size: 15px;
		}
	}

	@media screen and (min-width: 48rem) {
		.markdown {
			font-size: 16px;
		}
	}

	.markdown :global(p),
	:global(.air-p) {
		font-size: 1rem;
		margin-bottom: 0.2rem;
		text-align: left;
	}

	.markdown :global(h1),
	:global(.air-h1),
	:global(h2),
	:global(.air-h2),
	:global(h3),
	:gloabl(.air-h3),
	:global(h4),
	:global(.air-h4) {
		margin: 1.414rem 0 0.5rem;
		font-weight: inherit;
		line-height: 1.42;
	}

	.markdown :global(h1),
	:global(.air-h1) {
		margin-top: 0;
		font-size: 1.5rem;
		text-align: center;
		margin-bottom: 0.5em;
	}

	.markdown :global(h2) {
		font-family: Arimo, Helvetica, sans-serif;
	}

	.markdown :global(h2),
	:global(.air-h2) {
		font-size: 2.827rem;
	}
	.markdown :global(h3),
	:global(.air-h3) {
		font-size: 1.999rem;
	}

	.markdown :global(h4),
	:global(.air-h4) {
		font-size: 1.414rem;
	}

	.markdown :global(h5),
	:global(.air-h5) {
		font-size: 1.121rem;
	}

	.markdown :global(ul) {
		@apply list-disc;
	}

	.markdown :global(ol) {
		@apply list-decimal;
	}
	.markdown :global(h6),
	:global(.air-h6) {
		font-size: 0.88rem;
	}

	.markdown :global(small),
	:gloabl(.air-small) {
		font-size: 0.707em;
	}

	.markdown :global(img) {
		border-radius: 50%;
		height: 200px;
		margin: 0 auto;
		width: 200px;
	}

	.markdown :global(a),
	:global(a:visited) {
		color: #3498db;
	}

	.markdown :global(a:hover),
	:global(a:focus),
	:global(a:active) {
		color: #2980b9;
	}

	.markdown :global(pre) {
		background-color: #fafafa;
		padding: 1rem;
		text-align: left;
	}

	.markdown :global(p) {
		color: #777;
	}

	.markdown :global(blockquote) {
		margin: 0;
		border-left: 5px solid #7a7a7a;
		font-style: italic;
		padding: 1.33em;
		text-align: left;
	}
	/**/
	/*
	.markdown :global(h1) {
		font-size: 1.5rem;
	}
	.markdown :global(h2) {
		font-size: 1.25rem;
	}
		*/
</style>
