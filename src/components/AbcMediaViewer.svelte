<script lang="ts">
	import { onMount } from 'svelte';
	import { abcStore } from '$src/store';
	import urlParser from 'js-video-url-parser';

	import AbcAudioSoundDriver from './AbcAudioSoundDriver.svelte';
	import AbcVideoDriver from './AbcVideoDriver.svelte';
	import AbcScoreViewer from './AbcScoreViewer.svelte';

	let { video = undefined, audio = undefined, score = undefined, deleteElement } = $props();
	let { loggedUser } = abcStore;

	onMount(() => {
		console.log(`medias viewer mounted `);
		if (video) {
			console.log(`video : ${video.title}`);
		}
		console.log(`medias viewer mounted `);
		if (audio) {
			console.log(`audio : ${audio.title}`);
		}
		console.log(`medias viewer mounted `);
		if (score) {
			console.log(`score : ${score.title}`);
		}
	});

	function buildUrl(url: string): string {
		const returned = '/blobs/' + $loggedUser.email + '/' + url;
		console.log(`media url BUILT : ${returned}`);
		return returned;
	}

	function buildVideoUrl(url: string | undefined): string {
		if (!url) {
			return '';
		}
		const parsed = urlParser.parse(url);
		if (parsed != undefined) {
			if (parsed.provider === 'youtube') {
				let wurl = new URL(url);
				let returned = 'https://' + wurl.hostname + '/embed/' + parsed.id;
				console.log(`youtube url BUILT : ${returned}`);
				return returned;
			}
		}
		return url;
	}
</script>

<div class="my-2 container">
	<!--
	<AbcVideoDriver
		videoUrl={buildVideoUrl('https://www.youtube.com/embed/f0yllZQ0xQc')}
		title="Mulqueen by Martin Hayes"
		posterUrl=""
		deleteVideo={() => deleteElement()}
	/>
	<AbcVideoDriver
		videoUrl={buildVideoUrl('https://files.vidstack.io/sprite-fight/720p.mp4')}
		title="Sprite Fight"
		posterUrl="https://files.vidstack.io/sprite-fight/poster.webp"
		deleteVideo={() => deleteElement()}
	/>
	-->
	{#if video}
		<AbcVideoDriver
			videoUrl={buildVideoUrl(video.url)}
			title={video.title}
			posterUrl=""
			deleteVideo={() => deleteElement()}
		/>
	{/if}
	{#if audio}
		<AbcAudioSoundDriver
			audioUrl={buildUrl(audio.url)}
			title={audio.title}
			deleteAudio={() => deleteElement()}
		/>
	{/if}
	{#if score}
		<AbcScoreViewer scoreUrl={buildUrl(score.url)} deleteScore={() => deleteElement()} />
	{/if}
	<!-- ... -->
</div>
