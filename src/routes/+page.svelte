<script lang="ts">
	import { goto } from '$app/navigation';
	import { logger } from '$utils/ABCLogger';
	import AbcWelcomeImage from '$components/AbcWelcomeImage.svelte';
	import { abcStore } from '$src/store';
	import { _ } from 'svelte-i18n';

	const { loggedUser } = abcStore;

	function gotoRepo() {
		logger.debug('Route to /repository ...');
		console.log(`user =  ${$loggedUser.email}`);
		logger.debug(`connected = ${$loggedUser.isConnected}`);
		goto('/repository');
	}
</script>

<!-- height equals screen size minus header sie -->
<h1 class="h1 text-center">{$_('home.welcome')}</h1>
<div class="p-6">
	<AbcWelcomeImage />
</div>
<p class="mx-4">{$_('home.repoClick')}</p>
<section class="py-1">
	<button class="mx-4 btn preset-button-ok" on:click={gotoRepo}> Your music repository </button>
</section>
