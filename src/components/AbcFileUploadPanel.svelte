<script lang="ts">
	import { FileUpload } from '@skeletonlabs/skeleton-svelte';
	import Icon from '@iconify/svelte';

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
</script>

<FileUpload name="files" bind:files on:change={fileDroppedHandler}>
	<svelte:fragment slot="lead">
		<Icon width="1.75em" height="1.75em" icon="solar:upload-line-duotone" />
	</svelte:fragment>
	<svelte:fragment slot="message">{message}</svelte:fragment>
	<svelte:fragment slot="meta">{meta}</svelte:fragment>
</FileUpload>
<div class="border-2 border-dashed border-primary-500 rounded-xl">
	{#if files}
		<h2 class="px-2 bg-{status}-500">{transferMessage}</h2>
		{#each Array.from(files) as file}
			<p class="text-sm mx-1">{file.name} ({file.size} bytes)</p>
		{/each}
	{:else}
		<h2 class="px-2 bg-{status}-500">{transferMessage}</h2>
	{/if}
</div>
