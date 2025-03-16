/*
  Svelte global stores 
*/

import { type Writable, writable } from "svelte/store";

class AbcMessage {
  msg: string = "Ok";
  typ: string = "info";
}

export class AbcScoreData {
  oid: number;
  tablatureChecked: boolean = false;

  constructor(oid: number) {
    this.oid = oid;
  }
}

class ScoreContexts {
  contexts: { [key: number]: AbcScoreData } = [];

  addContext(oid: number) {
    this.contexts[oid] = new AbcScoreData(oid);
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
    public logOutAction: Writable<boolean> = writable(false),
    public scoreContext: Writable<ScoreContexts> = writable(new ScoreContexts())
  ) {}
}

// Export a singleton
export const abcStore = new AbcStore();

export { AbcMessage };
