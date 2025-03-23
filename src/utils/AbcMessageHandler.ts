/**
 * Adapter for AbcBottomMessage
 */
import { messageHandler } from '$src/store';

class AbcMessageHandler {
	public visible = false;
	public fadeTimer = -1;

	constructor(v: boolean = true, t: number = -1) {
		this.visible = v;
		this.fadeTimer = t;
	}

	get hasTimer() {
		if (this.fadeTimer != -1) {
			return true;
		}
		return false;
	}

	/* show / hide bottom page messge infos */
	switchMessage(): number | null {
		console.log('handler activated');
		if (!this.visible) {
			this.visible = true;
		} else {
			this.visible = false;
		}
		if (this.hasTimer) return this.fadeTimer;
		return null;
	}

	toggleMsgHandler() {
		console.log('Togling msg handler');
		this.switchMessage();
		messageHandler.set(this);
	}
}

export { AbcMessageHandler };
