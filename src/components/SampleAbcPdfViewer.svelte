<!--
  sample incremental pdf Viewer 
	TODO : ( see pdfmake package for ABC Formatting and printing )


	TODO : IMPLEMENT NAVIGATION TOOL ON TOP + ANY RELEVANT PDF FUNCTIONALITY
-->

<script lang="ts">
	import Icon from '@iconify/svelte';
	import { tick } from 'svelte';

	import * as pdfjs from 'pdfjs-dist';
	import * as worker from '../../node_modules/pdfjs-dist/build/pdf.worker.mjs';
	// import { later } from '$utils/samplepromise.mjs';
	import { abcStore } from '$src/store';

	let { isAdmin } = abcStore;

	import { onMount } from 'svelte';

	export let url: string | undefined = undefined;
	export let data: string | undefined = undefined;
	export let pageNum: number = 1;
	export let deleteScore: () => void;

	// CAVEAT : CHANGE pdf worker version link below UPON pdfjs paccjkage version changes
	// check Mozilla site : https://mozilla.github.io/pdf.js/
	// pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.mjs';
	pdfjs.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.mjs';

	let pdf;
	let pdfCanvas;
	let isInitialized = false;
	let printJS;

	let error: string | undefined = undefined;
	let numPages: number = 0;
	let page: number = 1;
	let scale = 1.0;

	const initialLoad = async () => {
		console.log('loading pdf entered ...');
		if (url == undefined && data == undefined) {
			console.error('PDF document not specified for SampleAbcPdfViewer');
			return;
		}
		console.log('before test using');
		if (url != undefined) {
			console.log('using url');
			try {
				pdf = await pdfjs.getDocument(url).promise;
			} catch (e: any) {
				error = e.message;
				console.error(e);
				return;
			}
			numPages = pdf.numPages;
		} else if (data != undefined) {
			console.log('using data');
			let bData = atob(data);
			try {
				pdf = await pdfjs.getDocument({ data: bData }).promise;
			} catch (e: any) {
				error = e.message;
				console.error(e);
				return;
			}
		}
		await tick();
		isInitialized = true;
		// pdf = await loadingTask.promise;
		console.log('PDF loaded');
	};

	onMount(async () => {
		console.log('AbcPdfViewer mounted');
		console.log('url :', url);
		console.log('data :', data);
		// load printJS
		const p = await import('print-js');
		printJS = p.default;
	});

	const renderPage = async (num: number) => {
		let page = await pdf.getPage(num);
		let viewport = page.getViewport({ scale: scale });

		// support HiDPI screens
		let outputScale = window.devicePixelRatio || 1;

		// prepare canvas using PDF Page dimension

		// var canvas = document.getElementById('the-canvas');
		var context = pdfCanvas.getContext('2d');

		pdfCanvas.width = Math.floor(viewport.width * outputScale);
		pdfCanvas.height = Math.floor(viewport.height * outputScale);
		pdfCanvas.style.width = Math.floor(viewport.width) + 'px';
		pdfCanvas.style.height = Math.floor(viewport.height) + 'px';

		var transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

		// Render PDF page into canvas context.
		var renderContext = {
			canvasContext: context,
			transform,
			viewport
		};
		page.render(renderContext);
	};

	initialLoad();

	$: if (isInitialized) renderPage(pageNum);

	function scoreDelete() {
		// TODO: request confirmation
		deleteScore();
	}

	// print pdf url if not undefined
	// else tranfer data to pdf ptint.pdf and print server side print.pdf
	function scorePrint() {
		console.log('print score image');
		if (url != undefined) {
			printJS({ printable: url, type: 'pdf' });
		}
		if (data != undefined) {
			// print pdf data
			printJS({ printable: data, type: 'pdf', base64: true });
		}
	}

	function zoomIn() {
		scale += 0.1;
		renderPage(page);
	}

	function zoomOut() {
		scale -= 0.1;
		renderPage(page);
	}

	function nextPage() {
		if (page < numPages) {
			page++;
			renderPage(page);
		}
	}

	function previousPage() {
		if (page > 1) {
			page--;
			renderPage(page);
		}
	}

	function hasPages() {
		return numPages > 1;
	}
</script>

{#if error != undefined}
	<p class="text-error-500">{error}</p>
{/if}
<div class="flex">
	<button
		type="button"
		disabled={hasPages() == false}
		class="player-button mx-1 my-1 btn-icon btn-icon-sm preset-filled"
		onclick={nextPage}
	>
		<Icon width="1em" height="1em" icon="ooui:next-ltr" />
	</button>
	<button
		type="button"
		disabled={hasPages() == false}
		class="player-button mx-1 my-1 btn-icon btn-icon-sm preset-filled"
		onclick={previousPage}
	>
		<Icon width="1em" height="1em" icon="ooui:previous-ltr" />
	</button>
	<button
		type="button"
		class="player-button mx-1 my-1 btn-icon btn-icon-sm preset-filled"
		onclick={zoomIn}
	>
		<Icon width="1em" height="1em" icon="ooui:zoom-in" />
	</button>
	<button
		type="button"
		class="player-button mx-1 my-1 btn-icon btn-icon-sm preset-filled"
		onclick={zoomOut}
	>
		<Icon width="1em" height="1em" icon="ooui:zoom-out" />
	</button>
	<button
		type="button"
		class="player-button mx-1 my-1 btn-icon btn-icon-sm preset-filled"
		onclick={scorePrint}
	>
		<Icon icon="material-symbols:print-outline" height="1em" width="1em" />
	</button>

	{#if $isAdmin}
		<button
			type="button"
			class="player-button mx-1 my-1 btn-icon btn-icon-sm preset-filled"
			onclick={scoreDelete}
		>
			<Icon width="1em" height="1em" icon="ion:trash" />
		</button>
	{/if}
	<div class="mx-1 flex flex-col justify-center items-center">
		<span>Page: <span>{page}</span> /<span>{numPages}</span></span>
	</div>
</div>

<div class="flex py-2 overflow-auto border-dotted rounded-md border-4 border-tertiary-300">
	<canvas class="flex flex-line" id="pdfCanvas" bind:this={pdfCanvas}></canvas>
</div>
