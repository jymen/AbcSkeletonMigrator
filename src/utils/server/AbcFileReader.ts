/**
 * This module is using node stuff and so is SERVER SIDE ONLY !!!
 * NB : You can use any Node js function since thi module runs under Node js control
 */
import { readFile } from 'fs';

export interface AbcFileReaderResult {
	err: string | undefined;
	data: any | undefined;
}

export class AbcFileReader {
	url: string; // expected to be server side relative in static

	private async readBinary() {
		return new Promise((resolve, reject) => {
			readFile(this.url, 'binary', (err, data) => {
				if (err) reject(err);
				else resolve(data);
			});
		});
	}

	async read(): Promise<AbcFileReaderResult> {
		try {
			let data = await this.readBinary();
			debugger;
			return { err: undefined, data: data };
		} catch (e: any) {
			return { err: 'AbcFileReader error :' + e.code, data: undefined };
		}
	}

	constructor(url: string) {
		this.url = url;
	}
}
