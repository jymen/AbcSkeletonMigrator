import { ABCOid } from './ABCData';
import { FileFolderCard } from '$src/data/AbcDataDisplay';

export enum MediaAction {
	Add = 'Add',
	Delete = 'Delete',
	None = 'None'
}

export class Media {
	action: MediaAction = MediaAction.None;
	oid: ABCOid;
	title: string | undefined;
	url: string | undefined;
	droppedContent: string | ArrayBuffer | null = null; // only used for uploa
	droppedFile: FileList | undefined; // only used for upload
	isAudio: boolean;
	isScore: boolean;

	constructor(
		isAudio: boolean = false,
		isScore: boolean = false,
		oid: ABCOid | undefined = undefined
	) {
		console.log('constructor Media');
		this.isAudio = isAudio;
		this.isScore = isScore;
		if (oid == undefined) {
			this.oid = new ABCOid();
		} else {
			this.oid = oid;
		}
	}

	checkUrl(): void {
		if (this.url != undefined) {
			if (this.url.startsWith('http')) return;
			// add oid only for uploaded files
			const strOid = this.oid.oid.toString();
			if (this.url.startsWith(strOid)) return;
			this.url = strOid + '.' + this.url;
		}
	}

	toJson(): string {
		return JSON.stringify(this);
	}
}

export class AudioVideoMedia extends Media {
	posterUrl: string | undefined;

	constructor() {
		super(false, false);
		console.log('constructor AudioVideoMedia');
	}

	static fromJson(source: string): AudioVideoMedia {
		return JSON.parse(source);
	}
}

export class ScoreMedia extends Media {
	constructor() {
		super(false, true);
		console.log('constructor ScoreMedia');
	}

	static fromJson(source: string): AudioVideoMedia {
		return JSON.parse(source);
	}
}

export class AbcMedias {
	videos: AudioVideoMedia[] = [];
	audios: AudioVideoMedia[] = [];
	scores: ScoreMedia[] = [];
	isScore: boolean = false;

	get hasScores(): boolean {
		return this.scores.length > 0;
	}

	get hasAudiosVideos(): boolean {
		return this.audios.length > 0 || this.videos.length > 0;
	}

	constructor(card: FileFolderCard, isScore: boolean = false) {
		console.log(`medias panel isScore : ${isScore}`);
		this.isScore = isScore;
		if (card.element != undefined) {
			const m = card.element.m;
			if (m != undefined) {
				this.audios = m.audios;
				this.videos = m.videos;
				this.scores = m.scores;
				if (this.audios) console.log('nb audios : ' + this.audios.length);
				if (this.videos) console.log('nb videos : ' + this.videos.length);
				if (this.scores) console.log('nb scores : ' + this.scores.length);
			}
		}
	}

	toJson(): string {
		return JSON.stringify(this);
	}

	static fromJson(source: string): AbcMedias {
		return JSON.parse(source);
	}
}
