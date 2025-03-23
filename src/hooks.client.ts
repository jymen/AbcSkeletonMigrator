import * as Sentry from '@sentry/sveltekit';
import type { HandleClientError } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import { ABCLogger } from '$utils/ABCLogger';
import { register, init, getLocaleFromNavigator } from 'svelte-i18n';
const log = new ABCLogger();

Sentry.init({
	/*...*/
});

export const handleError: HandleClientError = async ({ error, event }) => {
	console.log('client error entered');
	const errorId = uuidv4();
	// example integration with https://sentry.io/
	Sentry.captureException(error, { extra: { event, errorId } });

	return {
		message: 'Whoops!' + error,
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
	initialLocale: getLocaleFromNavigator()
});
