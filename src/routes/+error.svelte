<!--
  Error page to be customized and enhanced later
  This may also be deleted since not really useffull !!!!!!
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { emojis } from './emojis';
</script>

<h1>{$page.status}</h1>
<h2>new error enterred</h2>

<container class="flex justify-center">
	<div style="font-size: 5em">
		{emojis[$page.status] ?? emojis[500]}
	</div>
</container>
<p>
	ERROR : {$page.error?.message}
</p>
