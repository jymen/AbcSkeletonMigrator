import type { Actions } from '../[[authaction]]/$types';
import { AuthenticationData } from '$data/ABCData';
import { abcServer } from '$data/AbcServer';
import { logger } from '$utils/ABCLogger';
import { fail, type Cookies } from '@sveltejs/kit';
import { AbcSession } from '$utils/sessions';

function getStringArg(formData: FormData, name: string): string | undefined {
	const value = formData.get(name);
	if (value == undefined) return undefined;
	const returned = value.toString();
	if (returned == '') return undefined;
	return returned;
}

//
// Data validation
//
export const load = async ({ params, request }) => {
	// Server API:
	// debugger;
	console.log('loging load entered');

	// const form = await superValidate(schema);
	// Check optional authAction params
	let fx = 'login';
	if (params.authaction == 'newUser') {
		fx = 'newUser';
	}
	// Unless you throw, always return { form } in load and form actions.
	return { fx };
};

export const actions = {
	login: async ({ cookies, request }) => {
		debugger;
		const fData = await request.formData();
		const firstName = getStringArg(fData, 'firstName');
		const lastName = getStringArg(fData, 'lastName');
		const email = getStringArg(fData, 'email');
		const password = getStringArg(fData, 'password');

		// const form = await superValidate(request, schema);
		console.log('POST user :', email);
		// always cleanup cookies
		let session = new AbcSession(cookies);
		session.cleanup();
		// Convenient validation check:
		if (email == undefined || password == undefined) {
			// Again, return { form } and things will just work.
			return fail(400, { error: 'Login action missing arguments' });
		}

		// get form data
		let user = new AuthenticationData(firstName, lastName, email, password);
		// encrypt password
		let encryptor = abcServer.connector.publicKey;
		if (encryptor == undefined || user.password == undefined) {
			logger.debug('Null RSA encryptor or password missing');
			return {
				errorCode: -1,
				errorString: 'Null RSA encryptor or password missing'
			};
		}

		user.password = encryptor!.encryptWithPublicKey(user.password!);
		const json = user.encode();
		const formData = await abcServer.login(json);
		if (formData == undefined) {
			return {
				errorCode: -1,
				errorString: `Authentication failure for ${user.email}`
			};
		}
		//
		// Allocate new session for user
		//
		session.newSession(email);
		// Allways return form
		return {
			email: email,
			sessionId: session.sessionId
		};
	},
	register: async (event) => {
		debugger;
		// TODO register new user
	}
} satisfies Actions;
