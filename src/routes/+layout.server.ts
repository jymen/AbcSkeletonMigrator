import { logger } from '$utils/ABCLogger';
import { AbcSession, AbcSessionChecker } from '$utils/sessions';

/**
 * Common entry point use for user login check and any other
 * check requested by all routes
 * @param param0
 * @returns
 */
export const load = async ({ url, cookies, locals: locals }) => {
	logger.debug('Home Page Server Load entered ...');
	const session = new AbcSession(cookies);
	const checker = new AbcSessionChecker(session);
	return checker.check(url);
};
