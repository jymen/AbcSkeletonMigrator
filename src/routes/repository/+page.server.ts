import { logger } from '$utils/ABCLogger';
import type { Actions } from './$types';
import { DbOperation, SqlResult } from '$src/data/ABCData';
import { ProtocolLoader, DBType, DbRequestHandlerProxy, ABCQuery, ABCOid } from '$src/data/ABCData';
import { Base64 } from 'js-base64';

import { AbcSession, AbcSessionChecker } from '$utils/sessions';

//
// valled on page initial load
//
export async function load({ url, cookies, params, request, locals: locals }) {
	logger.debug('Repository Page Server Load entered ...');
	debugger;
	// We always should be wit a sessions here
	const dbName = locals.sessions!.curContext!.email;
	const dbType = 'postgres'; // to be improved later

	const session = new AbcSession(cookies);
	const checker = new AbcSessionChecker(session);
	checker.check(url);
	// if we're here
	const loader = new ProtocolLoader();
	const dbProtocol = loader.loadDbProtocol(dbName!, dbType as DBType);
	if (dbProtocol != undefined) {
		const query = new ABCQuery(true, new ABCOid(0));
		const r = await dbProtocol.load(query);
		return {
			errorCode: r.errorCode,
			errorString: r.error,
			jsonData: r.data
		};
	}
}

function getStringArg(formData: FormData, name: string): string | undefined {
	const value = formData.get(name);
	if (value == undefined) return undefined;
	const returned = value.toString();
	if (returned == '') return undefined;
	return returned;
}

//
// Called for db update / query  events only
//
export const actions = {
	// data loading from db
	load: async ({ cookies, request }) => {},
	// Sample test with exist Repo function
	existRepoTest: async ({ cookies, request }) => {
		// debugger;
	},
	// Misc update requests
	dbRequest: async ({ cookies, request }) => {
		debugger;
		logger.debug('Entering Repository Page Server dbRequest...');
		const formData = await request.formData();
		let mediaContent: any | undefined = undefined;
		let b64MediaContent: string | undefined = undefined;
		if (formData.get('files') != undefined) {
			// read media content
			console.log('files received');
			let file = formData.get('files') as File;
			mediaContent = new Uint8Array(await file.arrayBuffer());
			b64MediaContent = Base64.encode(mediaContent);
			console.log('file size = ' + file.size);
		}

		// const form = await superValidate(request, schema);
		const dbName = getStringArg(formData, 'dbName');
		const dbType = getStringArg(formData, 'dbType');
		const operation = getStringArg(formData, 'dbOperation');
		const media = getStringArg(formData, 'jsonMedia');

		if (dbName == undefined || dbType == undefined || operation == undefined) {
			logger.error('Repository API arguments missing');
			//form.data.errorCode = -1;
			//form.data.errorString = 'Repository API arguments missing';
			return {
				errorCode: -1,
				errorString: 'Repository API arguments missing'
			};
		}
		const jsonData = formData.get('jsonData')?.toString();
		const proxy = new DbRequestHandlerProxy(
			dbName,
			dbType as DBType,
			jsonData!,
			media,
			b64MediaContent
		);
		const result = await proxy.repositoryRequest(operation as DbOperation);
		logger.debug('Leaving Repository Page Server dbRequest');
		return {
			errorCode: result.errorCode,
			errorString: result.error,
			jsonData: result.data
		};
	}
} satisfies Actions;
