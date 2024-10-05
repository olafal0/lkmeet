<script lang="ts">
	import { type AudioTrack } from "livekit-client";
	import { onMount } from "svelte";

	export let track: AudioTrack | null;
	let audioContainer: HTMLSpanElement;

	onMount(() => {
		if (track) {
			audioContainer.replaceChildren(track.attach());
		}
	});
</script>

<span bind:this={audioContainer} />
