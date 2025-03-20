import { JSONStringify } from 'json-with-bigint';
import { DBType, StorageOperation, ImportOperation, ScoreDataStore } from '$data/ABCData';

class DBCore {
	name: string | null;
	type: DBType | null;

	constructor(name: string, type: DBType) {
		this.name = name;
		this.type = type;
	}

	static driverTypeFromString(name: string): DBType {
		switch (name) {
			case 'SqlLite':
				return DBType.Sqlite;
			default:
				return DBType.Undefined;
		}
	}

	getDbType(): string {
		switch (this.type) {
			case DBType.Sqlite:
				return 'Sqlite';
			default:
				return 'Not Implemented';
		}
	}
}

class ABCDb {
	core: DBCore;
	operation?: StorageOperation = undefined;
	importexport?: ImportOperation = undefined;
	data?: ScoreDataStore = undefined;

	constructor(core: DBCore, data?: ScoreDataStore) {
		this.core = core;
		this.data = data;
	}

	encode(): string {
		return JSONStringify(this);
	}
}

export { DBCore, ABCDb };
