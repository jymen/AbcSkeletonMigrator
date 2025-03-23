// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}
// src/app.d.ts

import { AbcServer } from '$data/AbcServer';
import { AbcSession } from '$utils/sessions';

//
// Global data
//
declare global {
	namespace App {
		interface Locals {
			abcServer?: AbcServer;
			sessions?: AbcSession;
			isLoggedIn: boolean;
		}
		interface Error {
			message: string;
			errorId: string;
		}
	}
}
