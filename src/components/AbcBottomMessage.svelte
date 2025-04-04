<script lang="ts">
	import { messageHandler, abcMessage } from '../store';
	import { AbcMessageHandler } from '$utils/AbcMessageHandler';
	import { fade } from 'svelte/transition';
	import { TypTransformer } from '$utils/TypTransformer';

	let nodeRef: Element | undefined = $state(undefined);

	/* fade bottom message out */
	function timeMsgHandler() {
		if ($messageHandler.hasTimer && $messageHandler.visible) {
			const h = new AbcMessageHandler($messageHandler.visible, $messageHandler.fadeTimer);
			console.log('fading timer setting ...');
			setTimeout(() => {
				console.log('fading timer has elapsed');
				h.switchMessage(); // to False
				messageHandler.set(h);
			}, h.fadeTimer);
		}
	}

	$effect(() => {
		console.log('AbcBottomMessage as been updated');
		timeMsgHandler();
	});
</script>

<div bind:this={nodeRef} transition:fade={{ delay: 100, duration: 100 }}>
	<div class="alert">
		<p class="text-primary-100 {$messageHandler.visible ? '' : 'invisible'}">{$abcMessage.msg}</p>
	</div>
</div>
