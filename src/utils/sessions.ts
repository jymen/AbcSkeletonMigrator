// import { RandomGenerator } from '@diplomatiq/crypto-random';
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import { SessionData } from '$data/ABCData';
import { redirect } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import { JSONStringify } from 'json-with-bigint';

const ABC_SESSION = 'sessionid';

class AbcSession {
	private cookies: Cookies;
	curContext?: SessionData;

	constructor(cookies: Cookies) {
		this.cookies = cookies;
		let curCookie = cookies.get(ABC_SESSION);
		if (curCookie != undefined) {
			this.curContext = SessionData.fromCookie(curCookie);
		}
	}

	public get sessionId(): string | undefined {
		return this.curContext?.oid;
	}

	public get email(): string | undefined {
		return this.curContext?.email;
	}

	public toPOJO(): any {
		if (this.curContext == undefined) return undefined;
		return {
			oid: this.curContext?.oid,
			email: this.curContext?.email
		};
	}

	/**
	 * establish a new cookie session for user when user
	 * has been authenticated
	 * @param email
	 */
	async newSession(email: string) {
		const randomString = uuidv4();
		this.curContext = new SessionData(randomString, email);
		this.cookies.set(ABC_SESSION, this.curContext!.toString(), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: !dev,
			maxAge: 60 * 20
		});
	}

	public get isExisting() {
		if (this.curContext != undefined) {
			return true;
		}
		return false;
	}

	cleanup() {
		this.cookies.delete(ABC_SESSION, {
			path: '/'
		});
		this.curContext = undefined;
	}

	toJson(): string {
		return JSONStringify(this);
	}
}

class AbcSessionChecker {
	private session: AbcSession;

	constructor(session: AbcSession) {
		this.session = session;
	}

	check(url: URL): any {
		if (this.session.isExisting) {
			return this.session.toPOJO();
		} else {
			// request user to be logged in
			if (!url.pathname.endsWith('/login') && !url.pathname.endsWith('/newUser')) {
				// not already in /login or authenticate route requested
				throw redirect(303, '/login');
			}
		}
		console.log(`curContext : ${this.session?.curContext}`);
		return this.session.toPOJO();
	}
}

//
// user context storage
//
let sessions: { [key: string]: SessionData } = {};

export { AbcSession, sessions, ABC_SESSION, AbcSessionChecker };
