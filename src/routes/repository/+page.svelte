<script lang="ts">
	//import type { PageData } from '../$types';
	import { abcStore } from '$src/store';
	import { JSONParse } from 'json-with-bigint';
	import { onMount } from 'svelte';
	import {
		AbcFolder,
		AbcFile,
		DbOperation,
		DBType,
		DbRequestHandlerStub,
		REPOSITORY_EMPTY
	} from '$src/data/ABCData';
	import AbcScoreLines from '$src/components/AbcScoreLines.svelte';
	import AbcTopMessage from '$src/components/AbcTopMessage.svelte';
	import { Media } from '$src/data/AbcMedias';
	import { AbcDbOperation, HtmlBinder } from '$src/utils/ABCDbOperation';
	import { enhance } from '$app/forms';

	export let data;

	let repositoryAction;

	let { loggedUser, currentRoot } = abcStore;

	onMount(() => {
		console.log(`repository route user logged : ${$loggedUser.email} `);
		// convert json loaded data to client Objects stuff
		debugger;
		dbError = data.errorCode!;
		if (data.errorCode == 0) {
			console.log('root JSON :', data.jsonData);
			let rootObject = JSONParse(data.jsonData!);
			if (rootObject == undefined) {
				console.log(`JSON Parse error on : ${data.jsonData}`);
				data.errorCode = -1;
				data.errorStr = 'repository root JSON decoding error ';
			} else {
				$currentRoot = AbcFolder.decode(rootObject)!;
			}
		}
		emptyRepository = checkEmptyRepository();
		if (emptyRepository) {
			$currentRoot = AbcFolder.emptyRoot();
			dbError = 0;
		}
	});

	// Client API STUB for db update
	async function dbRequestStub(
		dbName: string,
		dbType: DBType,
		candidate: AbcFile | AbcFolder,
		operation: DbOperation,
		media?: Media,
		files?: any
	) {
		let stub = new DbRequestHandlerStub(dbName, dbType, candidate, operation, media);
		const dbcandidate = stub.stub;
		dbcandidate.parent = candidate.pOid;
		// populate form data
		fDbName.value = dbName;
		fDbType.value = dbType;
		fOperation.value = operation;
		if (files != undefined) {
			fFileUpload.files = files.files;
		}
		// populate parent hierarchy only for ADD operation
		/* unnecessary
		if (operation != DbOperation.ADD && operation != DbOperation.IMPORT) {
			if (candidate.pOid) {
				candidate.pOid = candidate.parent!.oid;
				candidate.parent = undefined;
			}
		}
			*/
		fJsonData.value = dbcandidate.encode();
		if (media != undefined) {
			const jsonedMedia = media.toJson();
			fJsonMedia.value = jsonedMedia;
		}
		repositoryAction.action = '?/dbRequest';
		await repositoryAction.requestSubmit();
	}

	function checkEmptyRepository(): boolean {
		if (data.errorCode == REPOSITORY_EMPTY) return true;
		if ($currentRoot.isEmpty) return true;

		if (data.errorCode != undefined) {
			errMsg = data!.errorString!;
		}
		return false;
	}

	async function doDbOperation(event) {
		let candidate = event.candidate;
		let operation = event.operation;
		let media = event.media;
		let files = event.files;
		let op = new AbcDbOperation(
			repositoryAction,
			operation,
			$loggedUser.email!,
			DBType.PostGreSql,
			candidate,
			fJsonData
		);
		op.dbName.bind(fDbName);
		op.dbType.bind(fDbType);
		op.operation.bind(fOperation);
		if (files != undefined) {
			op.files = new HtmlBinder(files as FileList);
			op.files.bindFile(fFileUpload);
		}
		if (media != undefined) {
			op.media = new HtmlBinder(media);
			op.media.bindMedia(fJsonMedia);
		}
		await op.proceed('?/dbRequest');
	}

	// hidden form data input binding
	let fDbName;
	let fDbType;
	let fOperation;
	let fJsonData;
	let fJsonMedia;
	let fFileUpload;

	$: console.log(data);
	$: emptyRepository = false;
	$: dbError = 0; // no errors
	$: errMsg = '';

	//
	// Server side communication callbacks
	//
	const enHancer = ({ formElement, formData, action, cancel }) => {
		console.log('form: ', formElement);
		console.log('formData: ', formData);
		console.log('action: ', action);

		return async ({ result, update }) => {
			console.log('form submitted');
			if (result.type == 'failure') {
				console.log('form submission failed');
			} else {
				console.log('form submission success');
				// check internal errors
				if (result.data.errorCode != 0) {
					dbError = result.data.errorCode;
					errMsg = result.data.errorString;
				}
			}
		};
	};
</script>

<div>
	<h1 class="h6 px-5">{$loggedUser.email}</h1>
</div>
<div class="centered">
	<div class="pt-3">
		{#if dbError != 0}
			<AbcTopMessage msg={errMsg} typ="error"></AbcTopMessage>
		{:else if emptyRepository}
			<AbcTopMessage msg="empty repository" typ="warning"></AbcTopMessage>
		{/if}
	</div>

	<div class="">
		<AbcScoreLines dbOperation={doDbOperation} />
	</div>

	<form
		bind:this={repositoryAction}
		method="POST"
		enctype="multipart/form-data"
		use:enhance={enHancer}
	>
		<input name="files" type="file" bind:this={fFileUpload} hidden />
		<input name="dbName" type="hidden" bind:this={fDbName} />
		<input name="dbType" type="hidden" bind:this={fDbType} />
		<input name="dbOperation" type="hidden" bind:this={fOperation} />
		<input name="jsonData" type="hidden" bind:this={fJsonData} />
		<input name="jsonMedia" type="hidden" bind:this={fJsonMedia} />
	</form>
</div>
