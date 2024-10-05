<script lang="ts">
	import { type VideoTrack } from "livekit-client";
	import { onMount } from "svelte";

	export let track: VideoTrack | null;
	export let width = 1;
	export let height = 1;
	export let aspectRatio = 16 / 9;
	let videoContainer: HTMLDivElement;

	onMount(() => {
		if (track) {
			videoContainer.replaceChildren(track.attach());
		}
	});
</script>

<div
	bind:this={videoContainer}
	class="videoContainer"
	style={`
		flex: 0 0 calc(100% * ${aspectRatio > 1 ? width : height});
		height: calc(100% * ${aspectRatio < 1 ? width : height});
	`}
></div>

<style lang="scss">
	.videoContainer {
		:global(video) {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}
</style>
