import { AbcFileReader } from '$utils/server/AbcFileReader.js';

export async function load({ cookies }) {
	/*
	console.log('before read');
	const pdf = await read('./lib/assets/ABCquickRef.pdf').arrayBuffer();
	let encoded = btoa(pdf);
	console.log('encoded:', encoded);
	*/
	debugger;
	let reader = new AbcFileReader('./static/pdf/ABCquickRef.pdf');
	try {
		let pdfData = await reader.read();
		debugger;
		let returnedData: string = btoa(pdfData.data);
		return {
			err: undefined,
			pdfhelp: returnedData
		};
	} catch (e) {
		return {
			err: e,
			pdfhelp: undefined
		};
	}
}
