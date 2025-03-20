import { logger } from "$utils/ABCLogger";
import { AuthenticationData, SessionData } from "$data/ABCData";
import type { Cookies } from "@sveltejs/kit";
import { AbcSession } from "$utils/sessions";
import type { EntryPointArgs } from "$data/ABCData";
//import * as forge from 'node-forge';
import pkg from "node-forge";
const { pkcs5, cipher, util, pki, md } = pkg;
import { Base64 } from "js-base64";

const ABCSERVER_URL = "http://localhost:8000/API/0";

class Encryptor {
  publicKey: string;

  constructor(key: string) {
    this.publicKey = key;
  }

  /**
   * just encrypt sensible information using provided server public key
   * @param text
   * @returns
   */
  encryptWithPublicKey(text: string): string {
    console.debug(`used public key: ${this.publicKey}`);
    let publicKey = pki.publicKeyFromPem(this.publicKey);
    let b64 = Base64.encode(text);
    const encrypted = publicKey.encrypt(b64, "RSA-OAEP", {
      md: md.sha256.create(),
    });
    const basEncrypted = util.encode64(encrypted);
    console.debug(`cryted data: ${basEncrypted}`);
    return basEncrypted;
  }

  decryptWithPrivateKey(key: string, text: string): string {
    let privateKey = pki.privateKeyFromPem(key);
    text = util.decode64(text);
    const b64decrypted = privateKey.decrypt(text, "RSA-OAEP", {
      md: md.sha256.create(),
    });
    const decrypted = Base64.decode(b64decrypted);
    return decrypted;
  }
}

/**
 * Abc local host server entry point
 */
class AbcConnector {
  url: string = ABCSERVER_URL;
  publicKey?: Encryptor;
  session?: AbcSession;

  private async connectorFetch(route: string, json: string): Promise<Response> {
    return await fetch(route, {
      method: "PUT",
      body: json,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });
  }

  /**
   * basic entry point for ABC calls
   * @param json
   * @returns
   */
  async getAbcData(jsonIn: string): Promise<EntryPointArgs | null> {
    const response = await this.connectorFetch(this.url, jsonIn);
    if (response.ok) {
      const json = (await response.json()) as EntryPointArgs;
      return json;
    }
    throw `getAbcData unexpected returned message =>${response.status}`;
  }

  async login(json: string): Promise<AuthenticationData | null> {
    debugger;
    const response = await this.connectorFetch(this.url + "/login", json);
    if (response.ok) {
      const json = (await response.json()) as AuthenticationData;
      return json;
    }
    if (response.status == 401) {
      return null; // UNAUTHORIZES
    }
    throw `getAbcData unexpected returned message =>${response.status}`;
  }

  async ping(): Promise<boolean> {
    const response = await fetch(this.url + "/hellojson");
    if (response.ok) {
      const json = (await response.json()) as Record<string, string>;
      const map1 = new Map<string, string>(Object.entries(json));
      // convert received base64 to PEM public standard string key
      const msg = atob(map1.get("msg")!);
      logger.debug("json =" + msg);
      logger.debug("home page route checked => Got Pub Key ...");
      this.publicKey = new Encryptor(msg);
      return true;
    }
    throw "homePage ping unexpected returned message => check failure";
  }

  //
  // Init session by autheticating user
  //
  async initSession(cookies: Cookies): Promise<SessionData | undefined> {
    logger.debug("Session initting ...");
    this.session = new AbcSession(cookies);
    logger.debug("Session initted");
    if (this.session.isExisting) {
      return new SessionData(this.session.sessionId!, this.session.email!);
    }
    return undefined;
  }
}

/**
 * Global server Initialisation step (run once at startup)
 */
class AbcServer {
  public connector: AbcConnector = new AbcConnector();

  async initSession(cookies: Cookies): Promise<SessionData | undefined> {
    return await this.connector.initSession(cookies);
  }

  async login(json: string): Promise<AuthenticationData | null> {
    return await this.connector.login(json);
  }

  init() {
    console.log("Abc Svelte Server is initting ...");
    logger.debug("Log traces has been initted succesfully for Svelte server");
    console.log("Abc Svelte Server has initted");
  }
}

const abcServer: AbcServer = new AbcServer();

export { abcServer, AbcConnector, AbcServer, Encryptor };
