/*
  Svelte global stores 
*/

import { type Writable, writable } from 'svelte/store';
import { AbcMessageHandler } from '$utils/AbcMessageHandler';

import { SessionData, AbcFolder, AbcFile, Leaf, ROOT_FOLDER, ABCOid } from '$data/ABCData';
import type { Tablature } from 'abcjs';

class AbcMessage {
	msg: string = 'Ok';
	typ: string = 'info';
}

// the store will automatically infer the type from the initial value
export const messageHandler = writable(
	new AbcMessageHandler(
		true, // initialy show
		3000 // disapear after 3 seconds
	)
);

class AbcLineContext {
	file?: AbcFile;
	folder?: AbcFolder;
}

export class AbcScoreData {
	oid: number;
	tablatureChecked: boolean = false;
	tabInstrument: Tablature = {};

	constructor(oid: number) {
		this.oid = oid;
	}
}

class ScoreContexts {
	contexts: { [key: number]: AbcScoreData } = [];

	addContext(oid: number) {
		this.contexts[oid] = new AbcScoreData(oid);
	}

	updateContext(oid: number, tablatureChecked: boolean, tablature: Tablature) {
		let ctx = this.contexts[oid];
		ctx.tablatureChecked = tablatureChecked;
		ctx.tabInstrument = tablature;
	}

	getContext(oid: number): AbcScoreData {
		return this.contexts[oid];
	}
}

// Global Message singleton
export const abcMessage = writable(new AbcMessage());

class AbcStore {
	constructor(
		public isAdmin: Writable<boolean> = writable(false),
		public darkMode: Writable<boolean> = writable(false),
		public loggedUser: Writable<SessionData> = writable(new SessionData()),
		public logOutAction: Writable<boolean> = writable(false),
		public currentRoot: Writable<AbcFolder> = writable(
			new AbcFolder(new Leaf(ROOT_FOLDER), undefined, new ABCOid(0))
		),
		public tablatureChanged: Writable<number> = writable(0),
		public scoreContext: Writable<ScoreContexts> = writable(new ScoreContexts()),
		public currentLineContext: Writable<AbcLineContext> = writable(new AbcLineContext())
	) {}
}

// Export a singleton
export const abcStore = new AbcStore();

export { AbcMessage };
