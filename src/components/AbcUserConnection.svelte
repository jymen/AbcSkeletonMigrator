<!--

  User connection component

-->

<script lang="ts">
	import { Popover } from '@skeletonlabs/skeleton-svelte';

	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { abcStore } from '$src/store';
	import { SessionData } from '$src/data/ABCData';

	const { loggedUser, logOutAction } = abcStore;

	// used for displaying logout request alert
	let logoutPanel: boolean = $state(false);
	let title = $state($loggedUser.email);

	let openState = $state(false);

	function popoverClose() {
		openState = false;
	}

	$effect(() => {
		if ($loggedUser.isConnected) {
			title = $loggedUser.email;
		} else {
			title = 'Not connected';
		}
	});

	function logoutAction() {
		logoutPanel = false;
		// activate logout event follows
		$loggedUser = new SessionData(undefined, 'Not connected');
		$logOutAction = true; // request cookie cleanup
		if (!$page.url.pathname.endsWith('login')) {
			goto(base + '/login');
		}
	}

	$effect.pre(() => {
		console.log(`loggedUser : ${$loggedUser.email}`);
		if ($loggedUser.isConnected) {
			logoutPanel = true;
		}
	});

	function loggedInAction() {
		if ($loggedUser.isConnected) {
			// proceed with connection
			logoutPanel = true;
		}
	}

	function getUserColor(): string {
		return $loggedUser.isConnected ? 'green' : 'red';
	}
</script>

<Popover
	open={openState}
	onOpenChange={(e) => (openState = e.open)}
	positioning={{ placement: 'bottom' }}
	triggerBase="btn preset-tonal"
	contentBase="card  bg-surface-100 dark:bg-surface-800 p-4 space-y-4 max-w-[320px]"
	arrow
	arrowBackground="!bg-surface-200 dark:!bg-surface-500"
>
	{#snippet trigger()}
		<span>
			<Icon
				height="1.75em"
				width="1.75em"
				class={$loggedUser.isConnected ? 'text-success-700' : 'text-error-400'}
				icon="mingcute:user-3-line"
			/>
		</span>
	{/snippet}
	{#snippet content()}
		<article>
			<p class="opacity-60"></p>
			<div class="card p-4 preset-filled-warning-500" data-popup="popupClick">
				{#if logoutPanel}
					<aside class="">
						<!-- Message -->
						<div class="flex flex-row alert-message">
							<!-- Icon -->
							<Icon icon="mingcute:user-3-line" height="1.75em" width="1.75em" />
							<p class="mx-4 text-tertiary-500 dark:text-tertiary-200">
								please confirm logout for {$loggedUser.email}
							</p>
						</div>
						<!-- Actions -->
						<div class="pt-4 mx-2 flex flex-row items-center justify-center space-x-2">
							<button type="button" class="btn btn-sm preset-button-ok" onclick={logoutAction}
								>Ok</button
							>
							<button type="button" class="btn btn-sm preset-button-cancel" onclick={popoverClose}
								>Cancel</button
							>
						</div>
					</aside>
				{:else}
					<p>{'No user connected'}</p>
				{/if}
			</div>
		</article>
	{/snippet}
</Popover>

<style>
</style>
