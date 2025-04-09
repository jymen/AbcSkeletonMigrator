<script lang="ts">
	import { enhance } from '$app/forms';
	import { abcStore } from '$src/store';
	import AbcFileUploadPanel from '$src/components/AbcFileUploadPanel.svelte';
	const { loggedUser, currentRoot } = abcStore;

	let files: FileList;
	$: transferMessage = '';
	$: status = 'warning';

	$: if (files) {
		// Note that `files` is of type `FileList`, not an Array:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileList
		console.log(files);

		for (const file of files) {
			console.log(`${file.name}: ${file.size} bytes`);
		}
	}

	async function dropChangeHandler(event) {
		console.log('drop changed triggered filedata', event);
		files = event.currentTarget?.files;
		fDbName.value = $loggedUser.email!;
		fDbType.value = 'postgres'; // to be improved later
		fParent.value = $currentRoot.oid.oid.toString();
		transferMessage = 'click Import to upload';
		if (files) {
			for (const file of files) {
				// process dropped files
			}
		}
	}

	let fDbName: HTMLInputElement;
	let fDbType: HTMLInputElement;
	let fParent: HTMLInputElement;
</script>

<div>
	<!--
	<SuperDebug data={$form} />
	
	<h1>todoz</h1>
-->

	<form
		class="px-4"
		method="post"
		enctype="multipart/form-data"
		use:enhance={({ formElement, formData, action, cancel, submitter }) => {
			// `formElement` is this `<form>` element
			// `formData` is its `FormData` object that's about to be submitted
			// `action` is the URL to which the form is posted
			// calling `cancel()` will prevent the submission
			// `submitter` is the `HTMLElement` that caused the form to be submitted
			debugger;
			transferMessage = '';
			console.log('enhance entered');

			return async ({ result, update }) => {
				// `result` is an `ActionResult` object
				// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
				console.log('enhance return entered');
				if (result.type == 'failure') {
					status = 'error';
					transferMessage = 'error: ' + result.data?.message;
					console.error('error: ' + result.data?.message);
				} else {
					transferMessage = '';
					console.info('Uploaded');
				}
			};
		}}
	>
		<AbcFileUploadPanel meta="XML abc export files allowed." filesDropped={dropChangeHandler} />
		<div>
			<p class="px-2 bg-{status}-500">{transferMessage}</p>
		</div>

		<div class="flex flex-col items-center p-8">
			<button type="submit" class="btn preset-button-ok px-2">Import</button>
		</div>
		<input name="dbName" type="hidden" bind:this={fDbName} />
		<input name="dbType" type="hidden" bind:this={fDbType} />
		<input name="parent" type="hidden" bind:this={fParent} />
	</form>

	<!--
	<p>welcome to my page</p>
-->
</div>

<style>
</style>
