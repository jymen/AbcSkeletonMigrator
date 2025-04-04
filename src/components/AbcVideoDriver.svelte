<script lang="ts">
	import { t } from 'svelte-i18n';
	import Icon from '@iconify/svelte';
	import urlParser from 'js-video-url-parser';
	import { abcStore } from '$src/store';
	import { onMount } from 'svelte';

	let { isAdmin } = abcStore;

	let { videoUrl, title, posterUrl, deleteVideo } = $props();

	onMount(() => {
		console.log(`video viewer mounted `);
		console.log(`isAdmin : ${isAdmin}`);
	});

	function videoDelete() {
		// TODO: request confirmation
		deleteVideo();
	}

	function getVideoType(url: string): string {
		if (!url) {
			// defaulted to mp4
			return 'video/mp4';
		}
		const ext = url.split('.').pop();
		if (ext === 'mp4') {
			return 'video/mp4';
		}
		if (ext === 'webm') {
			return 'video/webm';
		}
		if (ext === 'ogg') {
			return 'video/ogg';
		}
		// defaulted to mp4
		return 'video/mp4';
	}

	function isYoutubeVideo(url: string): boolean {
		const parsed = urlParser.parse(url);
		if (parsed != undefined) {
			return parsed.provider === 'youtube';
		}
		return false;
	}
</script>

{#if $isAdmin}
	<button
		type="button"
		class="player-button mx-1 my-1 btn-icon btn-icon-sm preset-filled"
		onclick={videoDelete}
	>
		<Icon width="1em" height="1em" icon="ion:trash" />
	</button>
{/if}
{#if isYoutubeVideo(videoUrl)}
	<iframe
		height="315"
		class="w-full mx-2 my-2 border border-primary-800 rounded-md"
		src={videoUrl}
		allow="autoplay"
		{title}
	></iframe>
{:else}
	<figure class="w-full mx-2 my-2 border border-primary-800 rounded-md">
		<figcaption class="text-center text-xs font-bold italic text-primary-800">
			{title}
		</figcaption>
		<video class="w-full" controls preload="metadata" poster={posterUrl}>
			<source src={videoUrl} type={getVideoType(videoUrl)} />

			<track kind="captions" src={posterUrl} srclang="en" label="English" />
			<!-- Offer download -->
			<a href={videoUrl}>Download MP4</a>
		</video>
	</figure>
{/if}
