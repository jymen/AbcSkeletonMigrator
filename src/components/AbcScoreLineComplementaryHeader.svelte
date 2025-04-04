<!--
  Extra score head infos when opened
-->

<script lang="ts">
	import { _, date, locale } from 'svelte-i18n';

	export let scoreDate: Date;
</script>

<footer class="text-center">
	<small class="text-center pr-3">
		created : {$date(scoreDate, { format: 'medium' })}
	</small>
</footer>
