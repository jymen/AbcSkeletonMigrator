/**
 * Global server hook
 */
import * as Sentry from '@sentry/sveltekit';
import type { HandleServerError } from '@sveltejs/kit';
import { logger, ABCLogger } from '$utils/ABCLogger';
import { error } from '@sveltejs/kit';
import type { Handle, HandleFetch } from '@sveltejs/kit';
import { abcServer } from '$data/AbcServer';
import { AbcSession } from '$utils/sessions';
// First time initialisation point
import { building } from '$app/environment'; // <---- here
import { v4 as uuidv4 } from 'uuid';
import { register, init } from 'svelte-i18n';

const log = new ABCLogger();

class AbcServerError {
	code: number;
	message: string;
	id: string = uuidv4();

	constructor(code: number, msg: string) {
		this.message = msg;
		this.code = code;
	}

	emit(e: TypeError) {
		throw error(this.code, {
			errorId: uuidv4(),
			message: '🔥  ' + this.message + '\n reason :' + '/' + e.message + '\n' + e.stack
		});
	}

	emitFatal(e: any) {
		throw '🔥  ' + this.message + '\n reason :' + '/' + e.message + '\n' + e.stack;
	}
}

class HomePageChecker {
	async check(): Promise<void> {
		logger.debug('server checking home page route ...');
		const connector = abcServer!.connector;
		try {
			await connector.ping();
		} catch (e: any) {
			throw new AbcServerError(500, 'fail to ping internal ABC repository ...').emitFatal(e);
		}
	}
}

const runAllTheInitFunctions = async () => {
	// global instances
	abcServer.init();
	await new HomePageChecker().check();
	logger.debug('after home check');
};

//
// init stage
//
if (!building) {
	await runAllTheInitFunctions();
}

export const handle: Handle = async ({ event, resolve }) => {
	// debugger;
	logger.debug('entering handle url :  ' + event.url.pathname);
	event.locals.isLoggedIn = false; // set as default before checking
	if (event.locals.abcServer == undefined) {
		event.locals.abcServer = abcServer;
	}
	if (event.locals.sessions == undefined) {
		event.locals.sessions = new AbcSession(event.cookies);
	}
	// if route matches "/banana" return banana
	if (event.url.pathname.startsWith('/banana')) {
		return new Response('🍌');
	}

	if (event.url.pathname.startsWith('/authenticate')) {
		return new Response('🍌');
	}

	if (event.url.pathname.startsWith('/api')) {
		return new Response('🍌');
	}

	if (event.url.pathname.startsWith('/custom')) {
		return new Response('custom response');
	}
	const response = await resolve(event);
	// CAVEAT : need to be restrictied later
	response.headers.append('Access-Control-Allow-Origin', `*`);
	return response;
};

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
	logger.debug('Fetch hooks server side enterred');
	if (request.url.startsWith('https://nounours.jymengant.org/')) {
		// clone the original request, but change the URL
		request = new Request(
			request.url.replace('https://nounours.jymengant.org/', 'http://localhost:8000/'),
			request
		);
	}

	return fetch(request);
};

Sentry.init({
	/*...*/
});

export const handleError: HandleServerError = async ({ error, event }) => {
	const err = error as App.Error;
	const errorId = uuidv4();
	const msg = `Fatal Error occured on AbcServer : ${err.message} @ ${event.request.url}`;
	logger.error(msg);
	//return {
	//  message: 'Whoops!',
	//};
	return {
		message: `🔥  ${msg}`,
		errorId
	};
};

//
// I18n loalization setup
//
register('en', () => import('$lib/translation/english.json'));
register('fr', () => import('$lib/translation/french.json'));

init({
	fallbackLocale: 'en',
	initialLocale: 'en'
});
