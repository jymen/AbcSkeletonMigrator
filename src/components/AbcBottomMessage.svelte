<script lang="ts">
	import { messageHandler, abcMessage } from '../store';
	import { AbcMessageHandler } from '$utils/AbcMessageHandler';
	import { fade } from 'svelte/transition';
	import { TypTransformer } from '$utils/TypTransformer';

	let nodeRef: Element | undefined = $state(undefined);

	let classColor = $state(new TypTransformer($abcMessage.typ).toClassColor());

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

{#if $messageHandler.visible}
	<div bind:this={nodeRef} transition:fade={{ delay: 100, duration: 100 }}>
		<div class="alert bg-{classColor}-500">
			<p class="text-secondary-500">{$abcMessage.msg}</p>
		</div>
	</div>
{/if}
