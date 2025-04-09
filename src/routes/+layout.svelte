<script lang="ts">
	import ApplicationBar from '$src/components/ApplicationBar.svelte';
	import { abcStore } from '$src/store';
	import AbcBottomMessage from '$components/AbcBottomMessage.svelte';
	import AbcCopyright from '$components/AbcCopyright.svelte';
	import { onMount } from 'svelte';
	import { AbcMessageHandler } from '$utils/AbcMessageHandler';

	import { messageHandler, abcMessage } from '$src/store';

	import { SessionData } from '$src/data/ABCData';

	import '../app.css';

	const { loggedUser, logOutAction } = abcStore;
	let { data, children } = $props();

	function toggleMsgHandler() {
		console.log('Togling msg handler');
		const h = new AbcMessageHandler($messageHandler.visible, $messageHandler.fadeTimer);
		h.toggleMsgHandler();
	}

	$effect.pre(() => {
		console.log(`before DOM update logoutAction : ${$logOutAction} `);
		// logout requested => cleanup cookie on next login

		if (!$logOutAction) {
			// check that server cookies is still operational
			if (data.oid != undefined && $loggedUser.oid != data.oid) {
				$loggedUser = new SessionData(data.oid, data.email);
			}
			console.log(`current session: ${data}`);
			console.log(`loggedUser: ${$loggedUser.oid}`);
		}
	});

	onMount(() => {
		console.log('top layout is mounted ...');
		$abcMessage.typ = 'info';
		$abcMessage.msg = 'AbcMusicStudio is now ready';
	});
</script>

<div class="h-screen flex flex-col justify-start">
	<header class="p-4">
		<ApplicationBar />
	</header>
	{@render children()}
	<div class="fixed bottom-0 p-4">
		<footer class="p-4">
			<AbcBottomMessage />
			<AbcCopyright copyright="© 2021-2024 Copyright Jean-Yves Mengant" />
		</footer>
	</div>
</div>
