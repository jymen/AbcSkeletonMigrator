/**
 * COMMON client server structures
 */
// import _ from 'lodash'
//
// Data Semantics
//
//

/**
 Database Access common protocol
 */
import { logger } from "$utils/ABCLogger";
import { DBCore, ABCDb } from "./ABCDb";
import { abcServer } from "./AbcServer";
import { JSONStringify, JSONParse } from "json-with-bigint";
import { AbcMedias, Media } from "./AbcMedias";

interface ISqlResult {
  error?: string;
  errorCode?: number;
  data?: any;
}

const REPOSITORY_EMPTY = 7;
const ROOT_FOLDER = "root Folder";

class SqlResult {
  error?: string;
  errorCode?: number;
  data?: string;

  constructor(iResult: ISqlResult) {
    this.error = iResult.error;
    this.data = iResult.data;
    this.errorCode = iResult.errorCode;
  }

  isOk(): boolean {
    if (this.errorCode != undefined) {
      if (this.errorCode >= 0) return true;
    }
    return false;
  }

  isWarning(): boolean {
    if (this.errorCode == null) return false;
    if (this.errorCode > 0) return true;
    return false;
  }

  isError(): boolean {
    if (this.errorCode == null) return false;
    if (this.errorCode < 0) return true;
    return false;
  }

  check(): any {
    if (this.error != null) {
      throw new Error(this.error);
    } else {
      return this.data;
    }
  }

  static setError(msg: string): SqlResult {
    return new SqlResult({
      error: msg,
      errorCode: -1,
      data: undefined,
    } as ISqlResult);
  }

  static setWarning(msg: string, data?: any): SqlResult {
    return new SqlResult({
      data: data,
      errorCode: +1,
      error: msg,
    } as ISqlResult);
  }

  static setData(data: any): SqlResult {
    return new SqlResult({
      data: data,
      errorCode: 0,
      error: undefined,
    } as ISqlResult);
  }
}

interface DbProtocol {
  createDatabase(): Promise<SqlResult>;
  deleteDatabase(): Promise<SqlResult>;

  openDatabase(): Promise<SqlResult>;
  existsDatabase(): Promise<boolean>;

  closeDatabase(): Promise<SqlResult>;

  // do any cleanup requested
  terminate(): void;

  checkCatalog(): Promise<boolean>;

  add(candidate: ABCDbCandidate, parent: ABCOid): Promise<SqlResult>;
  import(parent: ABCOid, jsonData: string): Promise<SqlResult>;

  delete(candidate: ABCDbCandidate): Promise<SqlResult>;
  update(candidate: ABCDbCandidate, parent: ABCOid): Promise<SqlResult>;
  load(query: ABCQuery): Promise<SqlResult>;
}

interface ABCTreeElement {
  store(parent: AbcFolder, operation: StorageOperation);
}

enum ABCResType {
  ABCScore = 0,
  Group,
  GroupWithFolder,
  XmlMusicScore,
}

enum DatabaseAction {
  CreateDatabase,
  DeleteDatabase,
  ListDatabase,
  StorageOperation,
  Undefined,
}

interface ExistsDb {
  exists: boolean;
}

class PostgresDbProtocol implements DbProtocol {
  dbName: string;

  constructor(dbName: string) {
    this.dbName = dbName;
  }

  private async buildServerApi(
    fx: string,
    dbName: string,
    operation?: StorageOperation,
    importexport?: ImportOperation
  ): Promise<SqlResult> {
    let core = new DBCore(dbName, DBType.PostGreSql);
    let db = new ABCDb(core);
    db.operation = operation;
    db.importexport = importexport;
    let args = new EntryPointArgs(fx, db);
    const api = new AbcServerApi(args);
    let json = api.encode();
    let data = await abcServer.connector.getAbcData(json);
    return new SqlResult(data!.fxRet!);
  }

  async createDatabase(): Promise<SqlResult> {
    return new SqlResult({} as ISqlResult);
  }

  async deleteDatabase(): Promise<SqlResult> {
    return new SqlResult({} as ISqlResult);
  }

  async openDatabase(): Promise<SqlResult> {
    return new SqlResult({} as ISqlResult);
  }

  async existsDatabase(): Promise<boolean> {
    let data = await this.buildServerApi("ExistRepository", this.dbName);
    let jsonObj = JSONParse(data.data!); // string to "any" object first
    let exists = jsonObj as ExistsDb;
    return exists.exists;
  }

  async closeDatabase(): Promise<SqlResult> {
    return new SqlResult({} as ISqlResult);
  }

  // do any cleanup requested
  terminate(): void {}

  async checkCatalog(): Promise<boolean> {
    return true;
  }

  async doOperation(
    operation: DbOperation,
    candidate: ABCDbCandidate,
    parent?: ABCOid
  ): Promise<SqlResult> {
    let dbop = new StorageOperation(operation);
    dbop.candidate = candidate;
    dbop.parent = parent;
    return this.buildServerApi("StorageOperation", this.dbName, dbop);
  }

  async doImport(parent: ABCOid, jsonData: string): Promise<SqlResult> {
    let dbImport = new ImportOperation(
      DbOperation.IMPORT,
      parent,
      false,
      false,
      jsonData
    );
    return this.buildServerApi(
      "ImportOperation",
      this.dbName,
      undefined,
      dbImport
    );
  }

  async add(candidate: ABCDbCandidate, parent: ABCOid): Promise<SqlResult> {
    return await this.doOperation(DbOperation.ADD, candidate, parent);
  }

  async delete(candidate: ABCDbCandidate): Promise<SqlResult> {
    return await this.doOperation(DbOperation.DELETE, candidate);
  }

  async update(candidate: ABCDbCandidate, parent: ABCOid): Promise<SqlResult> {
    return await this.doOperation(DbOperation.UPDATE, candidate, parent);
  }

  async import(parent: ABCOid, jsonData: string): Promise<SqlResult> {
    return await this.doImport(parent, jsonData);
  }

  async load(query: ABCQuery, parent?: ABCOid): Promise<SqlResult> {
    let operation = new StorageOperation(DbOperation.LOAD, query, parent);
    return this.buildServerApi("StorageOperation", this.dbName, operation);
  }
}

class ProtocolLoader {
  loadDbProtocol(dbName: string, dbType: DBType): DbProtocol | undefined {
    switch (dbType) {
      case DBType.PostGreSql:
        return new PostgresDbProtocol(dbName);
      default:
        return undefined;
    }
  }
}

class DatabaseActionUtil {
  public static toString(action: DatabaseAction) {
    switch (action) {
      case DatabaseAction.CreateDatabase:
        return "CreateDatabase";
      case DatabaseAction.DeleteDatabase:
        return "DeleteDatabase";
      case DatabaseAction.ListDatabase:
        return "ListDatabase";
      case DatabaseAction.StorageOperation:
        return "StorageOperation";
      default:
        return "UndefinedAction";
    }
  }
}

interface ExportOptions {
  exportExtra: boolean;
  exportSound: boolean;
  exportIcon: boolean;
}

class DataContent {
  oid: ABCOid = new ABCOid();
  encoded: boolean = false;
  abc?: string;
  medias?: AbcMedias; // oundB64?: string;
  //imageB64?: string;
  //iconB64?: string;
  // missing stuff to be completed later

  static decode(source: any): DataContent | undefined {
    if (source == undefined) return undefined;
    let returned = new DataContent();
    returned.encoded = source.encoded;
    returned.abc = source.abc;
    returned.oid = source.oid;
    returned.medias = source.medias;
    return returned;
  }
}

class Leaf {
  oid: ABCOid = new ABCOid();
  title: string;
  creation: number = 0;
  tags?: string;
  storageURL?: string;
  iconURL?: string;
  imageURL?: string;
  imageZoom?: number;
  imageBgColor?: [number];
  soundURL?: string;
  comments?: string;
  contents?: DataContent;
  encoding?: number;
  type?: ABCResType;

  public get hasRootTitle() {
    if (this.title == ROOT_FOLDER) return true;
    return false;
  }

  constructor(title: string) {
    this.title = title;
  }

  makeExportable(exportType: ExportOptions) {
    // Browser NodeJS portability to be pondered HERE
    // for this method which may remain optional for the moment
  }

  static decode(source: any): Leaf | undefined {
    if (source == undefined) return undefined;
    let returned = new Leaf(source.title);
    returned.oid = ABCOid.check(source.oid);
    returned.tags = source.tags;
    returned.contents = DataContent.decode(source.contents);
    returned.encoding = source.encoding;
    returned.type = source.type;
    returned.storageURL = source.storageURL;
    returned.iconURL = source.iconURL;
    returned.imageURL = source.imageURL;
    returned.imageZoom = source.imageZoom;
    returned.imageBgColor = source.imageBgColor;
    returned.soundURL = source.soundURL;
    returned.comments = source.comments;
    return returned;
  }
}

class AbcFile implements ABCTreeElement {
  public oid: ABCOid = new ABCOid();
  public infos: Leaf;
  public parent?: AbcFolder;
  public pOid?: ABCOid; // parent OID used for Update/Delet operations only else undefined

  constructor(infos: Leaf, parent?: AbcFolder) {
    this.infos = infos;
    this.parent = parent;
  }

  static decode(source: any): AbcFile | undefined {
    if (source == null) return undefined;
    let leaf = Leaf.decode(source.infos) as Leaf;
    // parent is set to null to avoid circular refs
    let returned = new AbcFile(leaf, source.parent);
    return returned;
  }

  store(parent: AbcFolder, operation: StorageOperation) {
    let candidate = new ABCDbCandidate(false);
    candidate.file = this;
    operation.parent = parent!.oid;
    operation.candidate = candidate;
  }
}

interface JsonedRepository {
  root: AbcFolder;
}

class CommonFolder {
  public oid: ABCOid = new ABCOid();
  public infos: Leaf;
  public files: AbcFile[];
  public folders: AbcFolder[];

  constructor(infos: Leaf, oid?: ABCOid) {
    this.infos = infos;
    this.files = [];
    this.folders = [];
  }
}

class AbcFolder implements ABCTreeElement {
  public oid: ABCOid = new ABCOid();
  public infos: Leaf;
  public files: AbcFile[];
  public folders: AbcFolder[];
  public parent?: AbcFolder;
  public pOid?: ABCOid; // parent OID used for Update/Delete operations only else undefined

  public get isEmpty() {
    if (this.oid.oid == 0) {
      if (this.files.length == 0 && this.folders.length == 0) return true;
    }
    return false;
  }

  constructor(infos: Leaf, parent?: AbcFolder, oid?: ABCOid) {
    this.infos = infos;
    this.files = [];
    this.folders = [];
    this.parent = parent;
    if (oid != undefined) {
      this.oid = oid;
    }
  }

  static emptyRoot(): AbcFolder {
    return new AbcFolder(new Leaf(ROOT_FOLDER), undefined, new ABCOid(0));
  }

  static decode(source: any): AbcFolder | undefined {
    if (source == null) return undefined;
    let returned = AbcFolder.buildClasses(source);
    return returned;
  }

  public get childrenLength(): number {
    return this.folders.length + this.files.length;
  }

  addFile(infos: Leaf) {
    logger.debug(`adding AbcFile ${infos.title}`);
    this.files.push(new AbcFile(infos, this));
  }

  addFolder(infos: Leaf) {
    logger.debug(`adding folder ${infos}`);
    this.folders.push(new AbcFolder(infos, this));
  }

  add(candidate: ABCTreeElement) {
    if (candidate instanceof AbcFolder) {
      let fo = candidate as AbcFolder;
      fo.parent = this;
      this.folders.push(fo);
    } else {
      let fi = candidate as AbcFile;
      fi.parent = this;
      this.files.push(fi);
    }
  }

  remove(candidate: ABCTreeElement) {
    if ("files" in candidate) {
      const folder = candidate as AbcFolder;
      for (let ii = 0; ii < this.folders.length; ii++) {
        if (this.folders[ii].infos.title == folder.infos.title) {
          this.folders.splice(ii, 1);
        }
      }
    }
    if ("content" in candidate) {
      const c = candidate as unknown;
      const AbcFile = c as AbcFile;
      for (let ii = 0; ii < this.files.length; ii++) {
        if (this.files[ii].infos.title == AbcFile.infos.title) {
          this.files.splice(ii, 1);
        }
      }
    }
  }

  /**
   * For debugging purposes
   */
  dump() {
    logger.debug(`title = ${this.infos.title}`);
    logger.debug("CHILD FOLDERS : ");
    for (const childFolder of this.folders) {
      childFolder.dump();
    }
    for (const childF of this.files) {
      logger.debug(`child AbcFile title = ${childF.infos.title}`);
    }
  }

  static buildClasses(from: AbcFolder, parent?: AbcFolder): AbcFolder {
    const leaf = Leaf.decode(from.infos);
    const folder = new AbcFolder(leaf!);
    if (from.oid == undefined && leaf?.hasRootTitle) {
      from.oid = new ABCOid(0);
    }
    folder.oid = ABCOid.check(from.oid);
    if (from.folders != null) {
      from.folders.forEach(function (_, index, folders) {
        let child = AbcFolder.buildClasses(folders[index], from);
        folder.add(child);
      });
    }
    if (from.files != null) {
      from.files.forEach(function (_, index, files) {
        let fi = new AbcFile(files[index].infos, folder);
        fi.oid = ABCOid.check(files[index].oid);
        folder.add(fi);
      });
    }
    return folder;
  }

  dealWithParents(add: boolean) {
    for (const childFolder of this.folders) {
      if (add) {
        childFolder.parent = this;
      } else {
        childFolder.parent = undefined;
      }
      childFolder.dealWithParents(add);
    }
    for (const childF of this.files) {
      if (add) {
        childF.parent = this;
      } else {
        childF.parent = undefined;
      }
    }
  }

  store(parent: AbcFolder, operation: StorageOperation) {
    // store this in repository
    let candidate = new ABCDbCandidate(true);
    candidate.folder = this;
    operation.parent = this.parent!.oid;
    operation.candidate = candidate;
  }

  /**
   * Assume here that this is the parent of candidate
   * @param candidate Proceed with database saving for given candidate
   */
  save(candidate: AbcFile | AbcFolder, operationType: DbOperation) {
    console.log("saving :", candidate.infos.title);
    let operation = new StorageOperation(operationType);
    candidate.store(this, operation);
  }
}

interface DatabaseDataLoader {
  loadALL(): void | Error;
}

class ScoreDataStore {
  root: AbcFolder | undefined;

  constructor() {}

  setRoot(data: any) {
    if (data == null) {
      // build from scratch
      const leaf = new Leaf("This is the root tune");
      this.root = new AbcFolder(leaf);
    } else if (typeof data === "string") {
      // build from JSON
      this.fromJson(data);
    } else {
      // build from object
      this.root = data as AbcFolder;
    }
    this.root?.dump();
  }

  fromJson(jsonStr: string) {
    let jsoned = JSONParse(jsonStr) as JsonedRepository;
    if (jsoned.root != undefined) {
      this.root = AbcFolder.decode(jsoned.root);
      // this.root = jsoned.root.buildClasses(null)
    } else {
      this.root = undefined;
    }
  }

  unlinkParents() {
    // cleanup parents and stringify
    if (this.root != null) {
      this.root.dealWithParents(false);
    }
  }

  linkParents() {
    // cleanup parents and stringify
    if (this.root != null) {
      this.root.dealWithParents(true);
    }
  }

  fromLocalRepo(loader: DatabaseDataLoader) {
    loader.loadALL();
  }
}

//
// Database Semantics
//

enum DBType {
  Sqlite = "Sqlite",
  PostGreSql = "postgres",
  Cassandra = "cassandra", // not implemented Yet
  Undefined = "undefined",
}

enum DBAction {
  CREATE = "CreateDatabase" as any,
  DELETE = "DeleteDatabase" as any,
  LIST = "ListDatabase" as any,
  STORAGEOP = "StorageOperation" as any,
}

enum DbOperation {
  ADD = "Add",
  UPDATE = "Update",
  DELETE = "Delete",
  LOAD = "Load",
  IMPORT = "Import",
}

class ABCOid {
  public oid = 0;

  emit(): number {
    let min = Math.ceil(0);
    let max = Math.floor(5120000000);
    let random = Math.floor(Math.random() * (max - min)) + min;
    return new Date().getUTCMilliseconds() + random;
  }

  FormatNumber(length: number) {
    var r = "" + this.oid;
    while (r.length < length) {
      r = "0" + r;
    }
    return r;
  }

  toString(): string {
    let timestamp = this.oid.toString(16);
    return (
      timestamp +
      "xxxxxxxxxxxxxxxx"
        .replace(/[x]/g, function () {
          return ((Math.random() * 16) | 0).toString(16);
        })
        .toLowerCase()
    );
  }

  constructor(oid?: number) {
    if (oid == undefined) {
      this.oid = this.emit();
    } else {
      this.oid = oid;
    }
  }

  static decode(source: any): ABCOid {
    let returned: ABCOid = new ABCOid(source.oid);
    return returned;
  }

  static check(oid: ABCOid | undefined): ABCOid {
    if (oid) {
      return oid!;
    }
    return new ABCOid();
  }
}

class ABCQuery {
  isFolder: boolean;
  oid: ABCOid;

  constructor(isFolder: boolean, oid: ABCOid) {
    this.isFolder = isFolder;
    this.oid = oid;
  }

  static decode(source: any): ABCQuery | undefined {
    if (source == null) return undefined;
    return new ABCQuery(source.isFolder, ABCOid.decode(source.oid));
  }
}

class ABCDbImportCandidate {
  parent: ABCOid;
  jsonData: string;

  constructor(parent: ABCOid, jsonData: string) {
    this.parent = parent;
    this.jsonData = jsonData;
  }
}

class ABCDbCandidate {
  folder?: AbcFolder = undefined;
  file?: AbcFile = undefined;
  parent?: ABCOid = undefined;
  jsonedMedia?: string = undefined;
  jsonedMediaContent?: string = undefined;
  private isFolder = false;
  private oid?: ABCOid = undefined;

  constructor(
    isFolder: boolean,
    AbcFile?: AbcFile,
    folder?: AbcFolder,
    oid?: ABCOid,
    parent?: ABCOid,
    jsonedMedia?: string,
    jsonedMediaContent?: string
  ) {
    this.isFolder = isFolder;
    this.oid = oid;
    this.file = AbcFile;
    this.folder = folder;
    this.parent = parent;
    this.jsonedMedia = jsonedMedia;
    this.jsonedMediaContent = jsonedMediaContent;
  }

  static decode(source: any): ABCDbCandidate | undefined {
    if (source == null) return undefined;
    let folder = AbcFolder.decode(source.folder);
    let file = AbcFile.decode(source.file);
    let oid = ABCOid.decode(source.oid);
    let parent = ABCOid.decode(source.parent);
    let returned: ABCDbCandidate = new ABCDbCandidate(
      source.isFolder,
      file,
      folder,
      oid,
      parent
    );
    return returned;
  }

  //
  // Deal with Folder circular reference
  //
  encode(): string {
    const cache = new Set();
    const jsoned = JSONStringify(this);
    /*
     const jsoned = JSON.stringify(this, function (key, value) {
       if (typeof value === 'object' && value !== null) {
         console.log(key, value);
         if (cache.has(value)) {
           try {
             // If this value does not reference a parent it can be deduped
             return JSON.parse(JSON.stringify(value));
           } catch (err) {
             // discard key if value cannot be deduped
             if (key == 'parent') {
               let f = new AbcFolder(value.infos);
               f.oid = value.oid;
               return JSON.stringify(f);
             }
             return;
           }
         }
         // Store value in our set
         cache.add(value);
       }
       return value;
     });
     */
    return jsoned;
  }
}

class StorageOperation {
  op: DbOperation;
  parent?: ABCOid;
  candidate?: ABCDbCandidate = undefined;
  query?: ABCQuery = undefined;
  completion?: string = undefined;

  constructor(
    op: DbOperation,
    query?: ABCQuery | undefined,
    parent?: ABCOid | undefined
  ) {
    this.op = op;
    this.parent = parent;
    this.candidate = undefined;
    this.query = query;
  }

  static decode(source: any): StorageOperation | undefined {
    if (source == undefined) return;
    let parent: ABCOid = ABCOid.decode(source.parent);
    let query = ABCQuery.decode(source.query);
    let returned: StorageOperation = new StorageOperation(
      source.op,
      query,
      parent
    );
    returned.candidate = ABCDbCandidate.decode(source.candidate);
    return returned;
  }

  encode(): string {
    return JSONStringify(this);
  }
}

class FxRet {
  errorCode: number;
  error: string;
  data: string;

  constructor(data: string, error: string, errorCode: number) {
    this.errorCode = errorCode;
    this.error = error;
    this.data = data;
  }

  hasError(): boolean {
    if (this.errorCode < 0) return true;
    return false;
  }

  hasWarning(): boolean {
    if (this.errorCode > 0) return true;
    return false;
  }

  static decode(source: any): FxRet {
    return new FxRet(source.data, source.error, source.errorCode);
  }
}

class EntryPointArgs {
  driver: string = "postgres"; // the only implmenttion yet
  fx: string;
  jsonArgs: string;
  fxRet?: FxRet;

  constructor(fx: string, db: ABCDb, fxRet?: FxRet) {
    //this.className = className
    this.fx = fx;
    this.jsonArgs = db.encode();
    this.fxRet = fxRet;
  }

  encode(): string {
    return JSONStringify(this);
  }

  static decode(source: any): EntryPointArgs | undefined {
    if (source == undefined) return;
    let fxRet = FxRet.decode(source.fxRet);
    return new EntryPointArgs(source.fx, source.fxArgs, fxRet);
  }
}

/**
 * Server communication entry point
 */
class AbcServerApi {
  args: EntryPointArgs;

  constructor(args: EntryPointArgs) {
    this.args = args;
  }

  encode(): string {
    return JSONStringify(this);
  }
}

class AuthenticationData {
  oid: number = -1;
  userName?: string;
  fullName?: string;
  email?: string;
  password?: string;
  identity?: string; // computed by server upon creation

  constructor(uName?: string, fName?: string, email?: string, pwd?: string) {
    this.userName = uName;
    this.email = email;
    this.fullName = fName;
    this.password = pwd;
  }

  encode(): string {
    return JSONStringify(this);
  }

  static decode(source: any): AuthenticationData {
    return new AuthenticationData(source.data, source.error, source.errorCode);
  }
}

/**
 * Provide here data to be kepts for user connected sessions
 */
class SessionData {
  oid?: string;
  email?: string;

  get isConnected() {
    if (this.oid != undefined) return true;
    return false;
  }

  constructor(oid?: string, mail?: string) {
    this.oid = oid;
    this.email = mail;
  }

  toString(): string {
    return `${this.oid}#${this.email}`;
  }

  static fromCookie(str: string): SessionData {
    let splitted = str.split("#");
    return new SessionData(splitted[0], splitted[1]);
  }
}

class DbRequestHandlerStub {
  dbName: string;
  dbType: DBType;
  candidate: AbcFile | AbcFolder;
  operation: DbOperation;
  media?: Media;

  constructor(
    dbName: string,
    dbType: DBType,
    candidate: AbcFile | AbcFolder,
    operation: DbOperation,
    media?: Media
  ) {
    this.dbName = dbName;
    this.dbType = dbType;
    this.candidate = candidate;
    this.operation = operation;
    this.media = media;
  }

  public get stub() {
    let isFolder = false;
    let fo: AbcFolder | undefined;
    let fi: AbcFile | undefined;
    if (this.candidate instanceof AbcFolder) {
      isFolder = true;
      fo = this.candidate as AbcFolder;
    } else {
      fi = this.candidate as AbcFile;
    }
    return new ABCDbCandidate(isFolder, fi, fo);
  }
}

abstract class HandlerProxy {
  dbName: string;
  dbType: DBType;
  json: string;

  constructor(dbName: string, dbType: DBType, json: string) {
    this.json = json;
    this.dbName = dbName;
    this.dbType = dbType;
  }

  public get dbProtocol() {
    const loader = new ProtocolLoader();
    const dbProtocol = loader.loadDbProtocol(this.dbName, this.dbType);
    if (dbProtocol) return dbProtocol!;
    throw new Error(`missing db protocol for driver ${this.dbType}`);
  }

  abstract repositoryRequest(operation: DbOperation): Promise<SqlResult>;
}

class DbImportHandlerProxy extends HandlerProxy {
  parent: ABCOid;
  private candidate: ABCDbImportCandidate;

  constructor(dbName: string, dbType: DBType, parent: ABCOid, json: string) {
    super(dbName, dbType, json);
    this.parent = parent;
    this.candidate = new ABCDbImportCandidate(parent, json);
  }

  async repositoryRequest(operation: DbOperation): Promise<SqlResult> {
    console.log("entering importRequest");
    const p = super.dbProtocol;

    return await p.import(this.parent, this.candidate.jsonData);
  }
}

/**
 *  Handling Db request entry point for Svelte servers
 */
class DbRequestHandlerProxy extends HandlerProxy {
  private candidate: ABCDbCandidate;

  constructor(
    dbName: string,
    dbType: DBType,
    json: string,
    jsonedMedia?: string,
    jsonedMediaContent?: string
  ) {
    super(dbName, dbType, json);
    this.candidate = JSONParse(json) as ABCDbCandidate;
    // special media operation case
    this.candidate.jsonedMedia = jsonedMedia;
    this.candidate.jsonedMediaContent = jsonedMediaContent;
  }

  loadRoot(): string {
    return "";
  }

  // TESTING REPO
  async existRepoTest() {
    logger.debug("Testing existsRepo ...");
    // const response = await fetch(`https://www.thecolorapi.com/id?hex=`);
    const loader = new ProtocolLoader();
    const p = super.dbProtocol;
    if (p != undefined) {
      await p.existsDatabase();
    }
  }

  async repositoryRequest(operation: DbOperation): Promise<SqlResult> {
    console.log("entering dbRequest");
    let result: SqlResult = new SqlResult({
      error: "unexpected db operation ",
      errorCode: -1,
      data: undefined,
    });
    try {
      const p = super.dbProtocol;
      let existDb = await p.existsDatabase();
      if (existDb) {
        let parent = this.candidate.parent!;
        switch (operation) {
          case DbOperation.ADD:
            result = await p.add(this.candidate, parent);
            break;
          case DbOperation.UPDATE:
            result = await p.update(this.candidate, parent);
            break;
          case DbOperation.DELETE:
            result = await p.delete(this.candidate);
            break;
          case DbOperation.LOAD:
            result = new SqlResult({
              error: "Unexpected LOAD db operation :" + operation,
              errorCode: -1,
              data: undefined,
            });
            break;
          default:
            result = new SqlResult({
              error: "undefine repôsitory db operation :" + operation,
              errorCode: -1,
              data: undefined,
            });
            break;
        }
      } else {
        result = new SqlResult({
          error: this.dbName + ": Database not found  ",
          errorCode: -1,
          data: undefined,
        });
      }
    } catch (e: any) {
      return new SqlResult({
        error: e.toString(),
        errorCode: -1,
        data: undefined,
      });
    }
    return result;
  }
}

class ImportOperation {
  parent: ABCOid;
  fx: string;
  dataIsFile: boolean;
  reset: boolean;
  data: string;

  constructor(
    fx: string,
    parent: ABCOid,
    dataisFile: boolean,
    reset: boolean,
    data: string
  ) {
    this.parent = parent;
    this.fx = fx;
    this.dataIsFile = dataisFile;
    this.reset = reset;
    this.data = data;
  }
}

export {
  ABCOid,
  type ABCTreeElement,
  StorageOperation,
  ABCQuery,
  DbOperation,
  type ExportOptions,
  ABCDbCandidate,
  DBType,
  AbcFile,
  AbcFolder,
  ScoreDataStore,
  DataContent,
  Leaf,
  ABCResType,
  DatabaseAction,
  DatabaseActionUtil,
  type DatabaseDataLoader,
  DBAction,
  EntryPointArgs,
  FxRet,
  SessionData,
  type DbProtocol,
  ProtocolLoader,
  AbcServerApi,
  AuthenticationData,
  SqlResult,
  REPOSITORY_EMPTY,
  ROOT_FOLDER,
  DbRequestHandlerProxy,
  DbImportHandlerProxy,
  ImportOperation,
  ABCDbImportCandidate,
  DbRequestHandlerStub,
};
