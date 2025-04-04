<script lang="ts">
	import { page } from '$app/stores';
	import { emojis } from './emojis';
</script>

<div class="flex flex-col justify-center items-center">
	<h1 class="h1">{$page.status}</h1>
	<h2 class="h2">new error enterred</h2>

	<container class="flex flex-col justify-center items-center">
		<div style="font-size: 5em">
			{emojis[$page.status] ?? emojis[500]}
		</div>
	</container>
	<p class="text-error-50-950">
		ERROR : {$page.error?.message}
	</p>
</div>
