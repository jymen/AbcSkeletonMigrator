import { DbImportHandlerProxy, DBType, DbOperation, ABCOid } from '$src/data/ABCData.js';
import { fail } from '@sveltejs/kit';

export const load = async () => {
	console.log('load entered');
	//const form = await superValidate(schema);

	//const form = await superValidate(data, schema);
	return {
		loaded: true
	};
};

class ImportDataSender {
	buffer: ArrayBuffer;
	type: string;
	parent: number;
	dbName: string;
	dbType: string;

	constructor(b: ArrayBuffer, type: string, dbName: string, dbType: string, parent: string) {
		this.buffer = b;
		this.type = type;
		this.dbName = dbName;
		this.dbType = dbType;
		this.parent = parseInt(parent);
	}

	async proceed() {
		if (this.type == 'application/json') {
			// convert back to string
			const enc = new TextDecoder('utf-8');
			const json = enc.decode(this.buffer);
			let proxy = new DbImportHandlerProxy(
				this.dbName,
				this.dbType as DBType,
				new ABCOid(this.parent),
				json
			);
			let result = await proxy.repositoryRequest(DbOperation.IMPORT);
			if (result.errorCode != 0) {
				throw new Error(result.error);
			}
			console.log('json:', json);
		} else {
			throw new Error(`type ${this.type} not supported yet`);
		}
	}
}

export const actions = {
	default: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		if (!(formData.files as File).name || (formData.files as File).name === 'undefined') {
			return fail(400, {
				error: true,
				message: 'You must provide a file to upload'
			});
		}

		const { files } = formData as { files: File };
		const { parent } = formData as { parent: string };
		const { dbName } = formData as { dbName: string };
		const { dbType } = formData as { dbType: string };
		console.log(
			'received file : %s size :%d type: %s fbType %s',
			files.name,
			files.size,
			files.type
		);

		let sender = new ImportDataSender(
			await files.arrayBuffer(),
			files.type,
			dbName,
			dbType,
			parent
		);
		try {
			await sender.proceed();
			return {
				success: true
			};
		} catch (e: any) {
			return fail(400, {
				error: true,
				message: e.message
			});
		}
	}
};
