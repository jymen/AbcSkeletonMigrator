<!--
  Sample copyright component
-->

<script lang="ts">
	import { TypTransformer } from '$src/utils/TypTransformer';
	import Icon from '@iconify/svelte';

	export let msg: string = 'msg not provided';
	export let typ: string = 'tertiary';

	$: classColor = new TypTransformer(typ).toClassColor();
</script>

<footer class="text-center">
	<aside class="alert bg-{classColor}">
		<!-- Message -->
		<div class="alert-message">
			<p class="flex text-{classColor}-200">
				<Icon style="font-size: 2em" icon="octicon:alert-24" />
				<span class="py-2 px-4 font-semibold text-{classColor}-200">
					{msg}
				</span>
			</p>
		</div>
	</aside>
</footer>

<style lang="postcss">
	.bg-warning {
		background-color: orange;
	}
	.bg-error {
		background-color: red;
	}
</style>
