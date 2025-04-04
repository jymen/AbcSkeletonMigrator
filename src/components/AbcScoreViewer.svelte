<script lang="ts">
	import SampleAbcPdfViewer from './SampleAbcPdfViewer.svelte';
	import Icon from '@iconify/svelte';
	import { abcStore } from '$src/store';

	let { isAdmin } = abcStore;

	let { scoreUrl, deleteScore } = $props();

	let zoomIn: any = $state(undefined);
	let zoomOut: any = $state(undefined);
	let nextPage: any = $state(undefined);
	let previousPage: any = $state(undefined);
	let pdfPageNumber = 1;

	let isPdf = scoreUrl.endsWith('.pdf');
	let isImage =
		scoreUrl.endsWith('.jpg') ||
		scoreUrl.endsWith('.jpeg') ||
		scoreUrl.endsWith('.png') ||
		scoreUrl.endsWith('.gif');

	function scoreDelete() {
		// TODO: request confirmation
		deleteScore();
	}
	function scoreImageZoomIn() {}
	function scoreImageZoomOut() {}
	function scorePrint() {
		console.log('print score image');
	}
</script>

{#if isImage}
	<div class="flex">
		<button
			type="button"
			class="player-button mx-1 my-1 btn-icon btn-icon-sm preset-filled"
			bind:this={zoomIn}
		>
			<Icon width="1em" height="1em" icon="ooui:zoom-in" />
		</button>
		<button
			type="button"
			class="player-button mx-1 my-1 btn-icon btn-icon-sm preset-filled"
			bind:this={zoomOut}
		>
			<Icon width="1em" height="1em" icon="ooui:zoom-out" />
		</button>
		<button
			type="button"
			class="player-button mx-1 my-1 btn-icon btn-icon-sm preset-filled"
			onclick={scorePrint}
		>
			<Icon icon="material-symbols:print-outline" height="1em" width="1em" />
			<Icon width="1em" height="1em" icon="ion:trash" />
		</button>
		{#if isAdmin}
			<button
				type="button"
				class="player-button mx-1 my-1 btn-icon btn-icon-sm preset-filled"
				onclick={scoreDelete}
			>
				<Icon width="1em" height="1em" icon="ion:trash" />
			</button>
		{/if}
	</div>
{/if}

{#if isPdf}
	<SampleAbcPdfViewer url={scoreUrl} deleteScore={scoreDelete} />
{/if}
{#if isImage}
	<img src={scoreUrl} alt="score" />
{/if}
