/**
 * Data display definitions
 */

import { AbcFolder, AbcFile, DbOperation, DataContent } from '$src/data/ABCData';
import foldericon from '$lib/assets/songs-folder.svg';
import musicnotes from '$lib/assets/music.svg';
import backarrow from '$lib/assets/back.svg';
import { type Media } from 'abcjs';

class AbcPagerElementDisplay {
	image: string;
	text: string;
	width: string;

	constructor(text: string, image: string, width: string = 'w-12') {
		this.text = text;
		this.image = image;
		this.width = width;
	}
}

export class AbcPagerElement {
	e: AbcFolder | AbcFile;
	d: AbcPagerElementDisplay;
	m?: any;
	f?: FileList;
	isBack: boolean;
	expanded = false;

	constructor(e: AbcFolder | AbcFile, back: boolean = false) {
		this.e = e;
		this.isBack = back;
		if (this.isBack) {
			// always a parent Folder
			this.d = new AbcPagerElementDisplay(e.infos.title, backarrow, 'w-8');
		} else {
			if (e instanceof AbcFolder) {
				// a child folder
				this.d = new AbcPagerElementDisplay(e.infos.title, foldericon);
			} else {
				this.d = new AbcPagerElementDisplay(e.infos.title, musicnotes);
			}
		}
	}

	setExpanded(expanded: boolean) {
		this.expanded = expanded;
	}
	isExpanded() {
		return this.expanded;
	}
}

const emptyComments = `
# User Notes 


click the [Markdown](https://daringfireball.net/projects/markdown/) button above to 
Enter any suitable comments you need 

	`;

export class FileFolderCard {
	operation: DbOperation = DbOperation.UPDATE;
	element: AbcPagerElement;
	index: number;
	isOpen = false;
	isRoot = false;
	isMediaUpdate = false;

	getdefaultAbc(title: string | undefined = undefined) {
		if (title == undefined) {
			title = this.element.d.text;
		}
		let returned = `
% Default header template begins
% can be changed in preferences
%%vocalfont Bookman-Light 12
%%historyfont Bookman-Light 10
%%wordsfont Bookman-Light 14
%%composerfont Bookman-Light 12
%%titlefont Luminari 26
% Default header template ends
`;
		returned += 'T:' + title + '\n';
		returned += 'K:C\n';
		returned += 'W:No ABC source => this is the default template\n';
		// return default ABC template
		return returned;
	}

	constructor(element: AbcPagerElement, index: number, isRoot: boolean = false) {
		this.element = element;
		this.index = index;
		if (this.isRoot) this.index++;
		this.isRoot = isRoot;
		// populate medias
		if (element.e instanceof AbcFile) {
			this.element.m = element.e.infos.contents?.medias;
		}
	}

	get canExpand() {
		if (this.element.e instanceof AbcFile && this.isOpen) {
			return true;
		}
		return false;
	}

	get creationDate() {
		// let swiftTmDate = new Date(2001, 1, 1).getTime(); // swift epoch
		let creation = this.element.e.infos.creation;
		console.log(creation);
		let date = new Date(creation);
		return date;
	}

	private isBase64(str: string): boolean {
		try {
			return btoa(atob(str)) == str;
		} catch (err) {
			return false;
		}
	}

	private decode(source: any): any {
		if (source != undefined) {
			try {
				const decoded = atob(source!);
				console.log(decoded);
				return decoded;
			} catch (err) {
				return source;
			}
		}
		return undefined;
	}

	encode(source: any): any {
		if (source != undefined) {
			if (!this.isBase64(source as string)) {
				const encoded = btoa(source!);
				return encoded;
			}
			return source;
		}
		return undefined;
	}

	get abc() {
		let fi = this.element.e as AbcFile;
		if (fi.infos.contents != undefined) {
			return this.decode(fi.infos.contents!.abc);
		} else {
			return this.getdefaultAbc(this.element.d.text);
		}
	}

	updateFile(abc?: string, markdown?: string) {
		let fi = this.element.e as AbcFile;
		if (fi.infos.contents == undefined) {
			fi.infos.contents = new DataContent();
		}
		if (abc != undefined) {
			fi.infos.contents!.abc = this.encode(abc);
		}
		if (markdown != undefined) {
			fi.infos.comments = this.encode(markdown);
		}
	}

	get comments() {
		let fi = this.element.e as AbcFile;
		let comments = fi.infos.comments;
		if (comments == undefined || comments.length == 0) comments = emptyComments;
		return this.decode(fi.infos.comments);
	}

	get isFolder() {
		if (this.element.e instanceof AbcFolder) return true;
		return false;
	}

	get isFile() {
		if (this.element.e instanceof AbcFile) return true;
		return false;
	}

	get sounds() {
		let fi = this.element.e as AbcFile;
		const contents = fi.infos.contents;
		if (contents != undefined) {
			if (contents.medias != undefined) {
				return fi.infos.contents!.medias?.audios;
			}
		}
		return undefined;
	}

	get videos() {
		let fi = this.element.e as AbcFile;
		const contents = fi.infos.contents;
		if (contents != undefined) {
			if (contents.medias != undefined) {
				return fi.infos.contents!.medias?.videos;
			}
		}
		return undefined;
	}

	get image() {
		let fi = this.element.e as AbcFile;
		const contents = fi.infos.contents;
		if (contents != undefined) {
			return fi.infos.contents!.medias?.scores;
		}
		return undefined;
	}
}
