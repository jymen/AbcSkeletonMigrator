import {
	AbcFile,
	AbcFolder,
	DbRequestHandlerStub,
	DBType,
	DbOperation,
	ABCDbCandidate
} from '$src/data/ABCData';
import { Media } from '$src/data/AbcMedias';

// Db processing return code and message
export var dbError: number = 0;
export var errMsg: string | undefined;

export class HtmlBinder {
	value: string | FileList | Media | ABCDbCandidate | undefined;
	binder: any | undefined;

	constructor(value: string | FileList | Media | undefined) {
		this.value = value;
	}

	bind(binder: any) {
		this.binder = binder;
		this.binder.value = this.value as string;
	}

	bindFile(binder: any) {
		this.binder = binder;
		this.binder.files = this.value as FileList;
	}

	bindMedia(binder: any) {
		this.binder = binder;
		const jsoned = (this.value as Media).toJson();
		this.binder.value = jsoned;
	}

	bindCandidate(candidate: ABCDbCandidate) {
		const jsoned = candidate.encode();
		this.binder.value = jsoned;
	}
}

//
// Server side communication callbacks
//
export const enHancer = ({ formElement, formData, action, cancel }) => {
	console.log('form: ', formElement);
	console.log('formData: ', formData);
	console.log('action: ', action);
	errMsg = undefined;
	dbError = 0;

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

export class AbcDbOperation {
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
