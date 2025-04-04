/**
 *
 *  Data classes used for population through UI
 *
 */

export const midiInstruments = [
	['Acoustic  piano', 0],
	['electric piano', 4],
	['Harpsichord', 6],
	['Clavi', 7],
	['Celesta', 8],
	['accordeon', 21],
	['Tharmonica', 22],
	['Tango accordeon', 23],
	['Steel guitar', 25],
	['nylon guitar', 24],
	['Electric jazz guitar', 26],
	['Violin', 40],
	['Viola', 41],
	['Cello', 42],
	['Contrabass', 43],
	['Trumpet', 56],
	['Trombone', 57],
	['Tuba', 58],
	['Muted trumpet', 59],
	['French horn', 60],
	['Fute', 73],
	['Whistle', 78],
	['Banjo', 105],
	['Fiddle', 110]
];

export interface AbcMidiOptionsData {
	chords: boolean;
	melody: boolean;
	metronome: boolean;
	instrument: number;
}
