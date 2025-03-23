<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { abcStore } from '$src/store';
	import { SessionData } from '$src/data/ABCData.js';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	let { loggedUser } = abcStore;

	onMount(() => {
		console.log('login  is mounted ...');
		// cleanup user
		$loggedUser = new SessionData(undefined, 'Not connected');
	});

	$: loginError = 0; // no errors
	$: errMsg = undefined as string | undefined;

	let firstName: string = '';
	let lastName: string = '';
	let fx: string = 'login';
	let email: string = '';
	let password: string = '';

	//
	// Server side communication callbacks
	//
	const enHancer = ({ formElement, formData, action, cancel }) => {
		console.log('form: ', formElement);
		console.log('formData: ', formData);
		console.log('action: ', action);

		return async ({ result, update }) => {
			console.log('form submitted');
			if (result.type == 'failure') {
				console.log('form submission failed');
			} else {
				console.log('form submission success');
				// check internal errors
				if (result.data.errorCode) {
					loginError = result.data.errorCode;
					errMsg = result.data.errorString;
				} else {
					// Successful post! Do some more client-side stuff,
					// like showing a toast notification.
					console.log('login success');
					// set user
					$loggedUser = new SessionData(result.data.sessionId, result.data.email);
					console.debug(`logged in loggedUser: ${$loggedUser.email}`);
					// cookie should be set just jump to main window
					// to vaildate cookie
					goto('/', { replaceState: true });
				}
			}
		};
	};
</script>

<div class="mx-4 my-4">
	<form
		method="POST"
		use:enhance={enHancer}
		class="preset-form grow shadow-md rounded-xl px-8 pt-6 pb-8 mb-4"
	>
		{#if fx == 'newUser'}
			<div>
				<label class="label">
					<span>{$_('login.firstName')}</span>
					<input
						class="input"
						name="firstname"
						title="Input (text)"
						type="text"
						placeholder="John"
						required
						bind:value={firstName}
					/>
				</label>
			</div>
			<div class="py-5">
				<label class="label">
					<span>{$_('login.lastName')}</span>
					<input
						class="input"
						name="lastname"
						title="Input (text)"
						type="text"
						placeholder="Doe"
						required
						bind:value={lastName}
					/>
				</label>
			</div>
		{/if}
		<div>
			<label class="label">
				<span>{$_('login.mailAdress')}</span>
				<input
					class="preset-form-input-text"
					title="Input (email)"
					name="email"
					type="email"
					placeholder="john@example.com"
					autocomplete="email"
					required
					bind:value={email}
				/>
			</label>
		</div>
		<div class="py-5">
			<label class="label">
				<span>{$_('login.password')}</span>
				<input
					class={errMsg ? 'input input-error' : 'input'}
					name="password"
					title="password"
					type="password"
					placeholder={$_('login.password')}
					required
					bind:value={password}
				/>
				{#if loginError != 0}
					<p class="text-error-500">{errMsg}</p>
				{/if}
			</label>
		</div>
		<div class="flex justify-center items-center p-5 space-x-5">
			<button formaction="?/login" class="btn preset-button-ok">Ok</button>
			<button type="button" class="mx-4 btn preset-button-cancel">{$_('login.Cancel')}</button>
		</div>
	</form>
</div>
