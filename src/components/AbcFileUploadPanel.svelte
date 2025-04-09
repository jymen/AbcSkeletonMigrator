<script lang="ts">
	import { FileUpload } from '@skeletonlabs/skeleton-svelte';
	import Icon from '@iconify/svelte';
	import { AbcMessageHandler } from '$utils/AbcMessageHandler';
	import { abcStore } from '$src/store';
	import { messageHandler, abcMessage } from '$src/store';

	let {
		message = 'upload to server',
		meta = 'XML abc export files allowed.',
		filesDropped
	} = $props();

	let files: FileList | undefined = $state(undefined);
	// let fileInput: HTMLInputElement;

	let status: string = $state('warning');
	let transferMessage = $state('No file selected');

	function fileDroppedHandler(event) {
		console.log('drop changed triggered filedata');
		transferMessage = 'selected file : ';
		status = 'success';
		files = event.currentTarget?.files;

		filesDropped({
			files: { files }
		});
	}

	function toggleFileRejected() {
		console.log('Togling msg handler');
		$abcMessage.typ = 'error';
		$abcMessage.msg = 'Selected file rejected';
		const h = new AbcMessageHandler($messageHandler.visible, $messageHandler.fadeTimer);
		h.toggleMsgHandler();
	}
</script>

<FileUpload
	interfaceClasses="bg-surface-100 dark:bg-surface-800"
	name="files"
	label={message}
	onFileReject={toggleFileRejected}
	onFileAccept={fileDroppedHandler}
	onFileChange={fileDroppedHandler}
>
	{#snippet iconInterface()}<Icon
			width="1.75em"
			height="1.75em"
			icon="solar:upload-line-duotone"
		/>{/snippet}
</FileUpload>
<div class="px4 border-2 border-dashed border-surface-300 rounded-xl">
	{#if files}
		<h2 class="px-2 bg-{status}-500">{transferMessage}</h2>
		{#each Array.from(files) as file}
			<p class="text-sm mx-1">{file.name} ({file.size} bytes)</p>
		{/each}
	{:else}
		<h2 class="px-2 bg-{status}-500">{transferMessage}</h2>
	{/if}
</div>
