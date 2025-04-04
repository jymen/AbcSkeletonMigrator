<script lang="ts">
	/**
	 * This component is not visible and is only use for server side db updates
	 */
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import {
		AbcFile,
		AbcFolder,
		DbRequestHandlerStub,
		DBType,
		DbOperation,
		ABCDbCandidate
	} from '$src/data/ABCData';
	import { Media } from '$src/data/AbcMedias';
	import { FileFolderCard } from '$src/data/AbcDataDisplay';
	import { abcStore } from '$src/store';

	let { loggedUser } = abcStore;

	interface HtmlFileList {
		files: FileList;
	}

	onMount(() => {
		console.log('abcdbupdater mounted');
	});

	class HtmlBinder {
		value: string | HtmlFileList | Media | ABCDbCandidate | undefined;
		binder: any | undefined;

		constructor(value: string | HtmlFileList | Media | undefined) {
			this.value = value;
		}

		bind(binder: any) {
			this.binder = binder;
			this.binder.value = this.value as string;
		}

		bindFile(binder: any) {
			this.binder = binder;
			let candidate = this.value as HtmlFileList;
			this.binder.files = candidate!.files;
		}

		bindMedia(binder: any) {
			this.binder = binder;
			let candidate = this.value as Media;
			const jsoned = candidate.toJson();
			this.binder.value = jsoned;
		}

		bindCandidate(candidate: ABCDbCandidate) {
			const jsoned = candidate.encode();
			this.binder.value = jsoned;
		}
	}

	const enHancer = ({ formElement, formData, action, cancel }) => {
		console.log('form: ', formElement);
		console.log('formData: ', formData);
		console.log('action: ', action);
		errMsg = undefined;
		dbError = 0;

		return async ({ result, update }) => {
			console.log('form submitted');
			if (result.type == 'failure') {
				dbError = -1;
				errMsg = 'form submission failed';
				console.log(errMsg);
			} else if (result.type == 'error') {
				console.log('form submission error');
				dbError = -1;
				errMsg = result.error;
				console.log(errMsg);
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

	class AbcDbOperation {
		form: any;
		dbName: HtmlBinder;
		dbType: HtmlBinder;
		operation: HtmlBinder;
		htmlCandidate: HtmlBinder;
		media: HtmlBinder | undefined;
		files: HtmlBinder | undefined;
		errMsg: string | undefined;
		dbError: number = 0;

		// html binders

		private stub: DbRequestHandlerStub | undefined;
		private candidate: AbcFile | AbcFolder;

		constructor(
			form: any,
			operation: DbOperation,
			dbName: string,
			dbType: DBType,
			candidate: AbcFile | AbcFolder,
			fCandidate: any
		) {
			this.candidate = candidate;
			this.dbName = new HtmlBinder(dbName);
			this.dbType = new HtmlBinder(dbType);
			this.operation = new HtmlBinder(operation);
			this.htmlCandidate = new HtmlBinder(undefined);
			this.htmlCandidate.binder = fCandidate;
			this.form = form;
		}

		private parentCleanup(candidate: AbcFile | AbcFolder) {
			if (candidate.parent) {
				candidate.pOid = candidate.parent!.oid;
				candidate.parent = undefined; //prevent JSON circular reference
			}
			if (this.candidate instanceof AbcFolder) {
				// cleanup depandencies when updationg to avoid JSON recursivity error
				let fo = this.candidate as AbcFolder;
				fo.files = [];
				fo.folders = [];
			}
		}

		async proceed(actionParam: string) {
			console.log('dbOperation requested on ', this.candidate.infos.title);
			this.dbError = 0;
			this.parentCleanup(this.candidate);
			this.stub = new DbRequestHandlerStub(
				this.dbName.value as string,
				this.dbType.value as DBType,
				this.candidate as AbcFile | AbcFolder,
				this.operation.value as DbOperation,
				this.media?.value as Media
			);
			const dbcandidate = this.stub.stub;
			dbcandidate.parent = this.candidate.pOid;
			this.htmlCandidate.bindCandidate(dbcandidate);
			// populate form data
			this.form.action = actionParam;
			await this.form.requestSubmit();
		}
	}

	// Db processing return code and message
	let dbError: number = 0;
	let errMsg: string | undefined;

	//
	// proceed remote operation
	//
	export async function doUpdate() {
		console.log('proceeding with db update ...');
		debugger;
		let candidate = card.element;
		let operation = card.operation;
		let media = card.element.m;
		let files = card.element.f as any;
		let op = new AbcDbOperation(
			repositoryAction,
			operation,
			$loggedUser.email!,
			DBType.PostGreSql,
			candidate.e as AbcFile,
			fJsonData
		);
		op.dbName.bind(fDbName);
		op.dbType.bind(fDbType);
		op.operation.bind(fOperation);
		if (files != undefined) {
			op.files = new HtmlBinder(files);
			op.files.bindFile(fFileUpload);
		}
		if (card.isMediaUpdate) {
			op.media = new HtmlBinder(media);
			op.media.bindMedia(fJsonMedia);
		} else {
			op.media = undefined;
		}
		await op.proceed('?/dbRequest');
	}

	export function childFunction() {
		console.log('I got called in child component');
		return 'I got called in child component';
	}

	export let card: FileFolderCard;

	let repositoryAction: any;
	let fDbName;
	let fDbType;
	let fOperation;
	let fJsonData;
	let fJsonMedia;
	let fFileUpload;
</script>

<!-- Updating Form for markdown infos-->
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
