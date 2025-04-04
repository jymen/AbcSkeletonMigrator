import abcjs, {
	type EventCallbackReturn,
	type TimingCallbacksDebug,
	type TimingCallbacksPosition
} from 'abcjs';
import type { AbcMidiOptionsData } from '$src/utils/ABCPanelData';

import { logger } from '$utils/ABCLogger';
import { midiInstruments } from '$utils/ABCPanelData';

export interface CallBackTimer {
	(param1: string): void;
}

export enum SoundEvent {
	ready,
	lineEnd,
	start,
	finished,
	beat,
	event
}

export interface SvgPlayingListener {
	(evt: SoundEvent, data: Object): void;
}
export interface CallBackBeat {
	(param1: number, param2: number): void;
}

export interface AudioPanelCallbacks {
	timerCallback: CallBackTimer;
	beatCallback: CallBackBeat;
}

export class SvgFactory {
	private svg: SVGSVGElement;
	private cursor: SVGLineElement | undefined;

	constructor(svg: SVGSVGElement) {
		this.svg = svg;
	}

	createLine() {
		this.cursor = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		this.cursor.setAttribute('class', 'abcjs-cursor');
		this.setCursor(0, 0, 0, 0);
		// this.cursor.style.stroke = 'red';
		this.svg.appendChild(this.cursor);
	}

	hideLastCursor() {
		var lastSelection = this.svg.querySelectorAll('.highlight');
		for (var k = 0; k < lastSelection.length; k++) lastSelection[k].classList.remove('highlight');
	}

	setCursor(x1: number, y1: number, x2: number, y2: number) {
		this.cursor!.setAttributeNS(null, 'x1', String(x1));
		this.cursor!.setAttributeNS(null, 'y1', String(y1));
		this.cursor!.setAttributeNS(null, 'x2', String(x2));
		this.cursor!.setAttributeNS(null, 'y2', String(y2));
		console.log(`cursor set at (x1:${x1},y1:${y1},x2:${x2},y2:${y2} )`);
	}

	private setNote(ev: abcjs.NoteTimingEvent) {
		for (var i = 0; i < ev.elements!.length; i++) {
			var note = ev.elements![i];
			for (var j = 0; j < note.length; j++) {
				note[j].classList.add('highlight');
				console.log('note highlighted');
			}
		}
	}

	private unsetNote() {
		var lastSelection = this.svg.querySelectorAll('.highlight');
		for (var i = 0; i < lastSelection.length; i++) {
			lastSelection[i].classList.remove('highlight');
		}
	}

	setNewCursor(ev: abcjs.NoteTimingEvent) {
		this.setNote(ev);
		this.setCursor(ev.left! - 2, ev.top!, ev.left! - 2, ev.top! + ev.height!);
	}

	endCursor() {
		this.unsetNote();
		this.setCursor(0, 0, 0, 0);
	}
}

/*
export class AbcCursorControl implements abcjs.CursorControl {
	beatSubDivision?: number | undefined;
	private svgFactory: SvgFactory;

	constructor(svg: SVGSVGElement, beatSubdiv: number) {
		this.beatSubDivision = beatSubdiv;
		this.svgFactory = new SvgFactory(svg);
	}

	onReady(): void {
		logger.debug('on ready enterered');
	}

	onLineEnd(): void {
		logger.debug('on LineEnd enterered');
	}

	onStart(): void {
		logger.debug('on start enterered');
		this.svgFactory.createLine();
	}

	onFinished(): void {
		logger.debug('on finished enterered');
		this.svgFactory.endCursor();
	}

	onBeat(beatNumber: number, totalBeats: number, totalTime: number): void {
		logger.debug('on beat enterered');
	}

	onEvent(ev: abcjs.NoteTimingEvent): void {
		logger.debug('on event enterered');
		if (ev.measureStart && ev.left === null) return; // this was the second part of a tie across a measure line. Just ignore it.

		this.svgFactory.hideLastCursor();
		this.svgFactory.setNewCursor(ev);
	}
}
*/

export class ABCJsMidiController {
	private midiBuffer: abcjs.MidiBuffer | undefined;
	private visualObj: any | undefined;
	private svg: SVGSVGElement | undefined;
	private tuneReady: boolean = false;
	private tuneStarted: boolean = false;
	private tunePaused: boolean = false;
	private audioContext: AudioContext | undefined;
	private audioBuffer: AudioBuffer | undefined;
	// private cursorControl: AbcCursorControl | undefined;
	private timer: abcjs.TimingCallbacks | undefined;
	private subdivision: number = 16;
	private currentTempo: number | undefined;
	private callbacks: AudioPanelCallbacks | undefined;
	private svgNotifier: SvgPlayingListener | undefined;
	totalBeats: number = 0;
	totalTime: number = 0;

	constructor() {
		console.log('constructor entererd');
	}

	setCallbacks(callbacks: AudioPanelCallbacks) {
		this.callbacks = callbacks;
	}

	setSvgNotifier(notifier: SvgPlayingListener) {
		this.svgNotifier = notifier;
	}

	get tuneDuration(): number {
		if (this.audioBuffer != undefined) {
			return this.audioBuffer!.duration;
		}
		return -1;
	}

	private msToStrTime(ms: number) {
		let s = ms / 1000;
		let secs = s % 60;
		s = (s - secs) / 60;
		let secstr = Math.floor(secs).toString();
		let mins = s % 60;
		let minstr = Math.floor(mins).toString();

		return minstr.padStart(2, '0') + ':' + secstr.padStart(2, '0');
	}

	// Callback function
	public beatCallback = async (
		beatNumber: number,
		totalBeats: number,
		totaltime: number,
		position: TimingCallbacksPosition,
		debugInfo: TimingCallbacksDebug
	) => {
		console.log('beat callback entererd:' + beatNumber);
		console.log('beat totals:' + totalBeats);
		console.log('time totals:' + totaltime);
		// console.log('timer beats total :', (this.timer as any).totalBeats);
		if (this.callbacks != undefined) {
			this.callbacks.beatCallback(beatNumber, totalBeats);
		}
		if (this.svgNotifier != undefined) {
			// manage score cursor
			this.svgNotifier(SoundEvent.beat, { beatNumber, totalBeats, totaltime });
		}
		// manage score cursor
		// this.cursorControl?.onBeat(beatNumber, totalBeats, totaltime);
		//
		if (beatNumber == totalBeats) {
			this.midiBuffer?.stop();
			this.timer?.stop();
			this.timer?.reset();
			this.tuneStarted = false;
			// this.cursorControl?.onFinished();
			if (this.svgNotifier != undefined) {
				// manage score cursor
				this.svgNotifier(SoundEvent.finished, {});
			}
		}
	};

	// Callback function
	public eventCallback: (event: any) => EventCallbackReturn = (event) => {
		if (event == undefined) return 'continue';
		console.log('event callback entered milliseconds ', event.milliseconds);
		let strTime = this.msToStrTime(event.milliseconds);
		if (this.callbacks != undefined) {
			this.callbacks.timerCallback(strTime);
		}
		// manage score cursor
		if (this.svgNotifier != undefined) {
			// this was the second part of a tie across a measure line. Just ignore it.
			if (!(event.measureStart && event.left === null)) {
				this.svgNotifier(SoundEvent.event, { event });
			}
		}
		// this.cursorControl?.onEvent(event);
		return 'continue';
	};

	// Callback function
	public lineEndCallback = () => {
		console.log('line end callback entered');
		if (this.svgNotifier != undefined) {
			// manage score cursor
			this.svgNotifier(SoundEvent.lineEnd, {});
		}
	};

	// Callback function
	public debugCallback = (infos) => {
		console.log('DEBUGCALLBAcK : ' + infos);
	};

	public get isReady() {
		if (this.timer && this.audioBuffer) return true;
		return false;
	}

	async prepareTune(tempo: number, audioOptions: AbcMidiOptionsData) {
		let self = this;
		// An audio context is needed - this can be passed in for two reasons:
		// 1) So that you can share this audio context with other elements on your page.
		// 2) So that you can create it during a user interaction so that the browser doesn't block the sound.
		// Setting this is optional - if you don't set an audioContext, then abcjs will create one.
		// window.AudioContext = window.AudioContext;
		// var audioContext = new window.AudioContext();
		console.log('audiocontext resumed');
		let millisecondsPerMeasure = self.visualObj.millisecondsPerMeasure(tempo);
		self.currentTempo = Math.round(
			(self.visualObj.getBeatsPerMeasure() / millisecondsPerMeasure) * 60000
		);
		self.midiBuffer = new abcjs.synth.CreateSynth();
		try {
			console.log('instrument : ', midiInstruments[audioOptions.instrument][1]);
			let preloaded = await self.midiBuffer.init({
				visualObj: self.visualObj,
				audioContext: self.audioContext,
				millisecondsPerMeasure: millisecondsPerMeasure,
				//debugCallback: self.debugCallback
				options: {
					chordsOff: !audioOptions.chords,
					voicesOff: !audioOptions.melody,
					program: midiInstruments[audioOptions.instrument][1] as number
				}
			});
			// prime prepare audio buffer for playing
			await self.midiBuffer.prime();
			self.timer = new abcjs.TimingCallbacks(self.visualObj, {
				beatCallback: self.beatCallback,
				eventCallback: self.eventCallback,
				lineEndCallback: self.lineEndCallback,
				qpm: self.currentTempo,
				extraMeasuresAtBeginning: undefined,
				lineEndAnticipation: 0,
				beatSubdivisions: self.subdivision
			});
			// progressing cursor on score
			if (self.svgNotifier != undefined) {
				// manage score cursor
				self.svgNotifier(SoundEvent.ready, {});
			}

			// At this point, everything slow has happened. midiBuffer.start will return very quickly and will start playing very quickly without lag.
			self.audioBuffer = await self.midiBuffer?.getAudioBuffer();
			self.totalTime = self.audioBuffer!.duration;
			console.log('totaltime : ', self.totalTime);
			console.log('totalbeats : ', self.totalBeats);
			// Notify UI for possible time change
			return Promise.resolve();
		} catch (error) {
			console.warn('synth prepate tune error', error);
		}
	}

	async startTune(): Promise<void> {
		console.log('startTune');
		let self = this;
		if (self.isReady) {
			self.midiBuffer!.start();
			await self.timer!.start();
			// self.cursorControl?.onStart();
			if (this.svgNotifier != undefined) {
				// manage score cursor
				this.svgNotifier(SoundEvent.start, {});
			}

			self.tuneStarted = true;
		}
	}

	seek(percent: number) {
		if (percent > 0 && percent <= 1) {
			if (this.midiBuffer) {
				this.midiBuffer!.seek(percent, 'percent');
				this.timer!.setProgress(percent, 'percent');
			}
		}
	}

	setTune(visualObj: any, svg: SVGSVGElement, notifier: SvgPlayingListener): any {
		if (abcjs.synth.supportsAudio()) {
			this.visualObj = visualObj;
			this.audioContext = new window.AudioContext();
			this.svg = svg;
			this.svgNotifier = notifier;
			return undefined;
		} else {
			console.error('Audio is not supported in this browser.');
			return 'Audio is not supported in this browser.';
		}
	}

	pauseTune() {
		if (this.tuneStarted) {
			this.midiBuffer?.pause();
			this.timer?.pause();
			this.tunePaused = true;
		}
	}

	resumeTune() {
		if (this.tuneStarted && this.tunePaused) {
			this.midiBuffer?.resume();
			this.timer?.start();
			this.tunePaused = false;
		}
	}

	resetTune() {
		if (this.tuneReady) {
			this.midiBuffer?.stop();
			this.midiBuffer?.seek(0);
			this.timer?.stop();
			this.timer = undefined;
			this.midiBuffer = undefined;
			this.tuneStarted = false;
			this.tuneReady = false;
		}
	}
}
