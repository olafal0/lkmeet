<script lang="ts">
	import type { PageData } from "./$types";
	import { onMount } from "svelte";
	import { room } from "$lib/lk/room";
	import { browser } from "$app/environment";
	import VideoTrack from "$lib/video/VideoTrack.svelte";
	import AudioTrack from "$lib/video/AudioTrack.svelte";
	import Camera from "$lib/icons/Camera.svelte";
	import Microphone from "$lib/icons/Microphone.svelte";
	import MicrophoneSlash from "$lib/icons/MicrophoneSlash.svelte";
	import CameraSlash from "$lib/icons/CameraSlash.svelte";

	export let data: PageData;
	let videoContainer: HTMLDivElement;
	let showVideoDevices = false;
	let showAudioDevices = false;
	let videoEnabled = false;
	let audioEnabled = false;
	let aspectRatio = 16 / 9;

	onMount(async () => {
		await $room.join(data.serverUrl, data.joinToken);
		videoEnabled = true;
		audioEnabled = true;
		if (browser) {
			const resize = () => {
				aspectRatio = videoContainer.offsetWidth / videoContainer.offsetHeight;
			};
			window.onresize = resize;
			resize();
		}
	});

	$: if ($room.room.state === "connected") {
		$room.room.localParticipant.setCameraEnabled(videoEnabled);
		$room.room.localParticipant.setMicrophoneEnabled(audioEnabled);
	}

	$: totalParticipants = $room.remoteVideo.length + (videoEnabled ? 1 : 0);
	$: widthBasis = 1 / Math.ceil(Math.sqrt(totalParticipants));
	$: heightBasis = 1 / Math.ceil(totalParticipants / Math.ceil(Math.sqrt(totalParticipants)));
</script>

<div class="videoContainer" bind:this={videoContainer}>
	<span id="local" />
	{#if $room.localVideo}<VideoTrack
			track={$room.localVideo}
			width={widthBasis}
			height={heightBasis}
			{aspectRatio}
		/>{/if}
	<span id="remote" />
	{#each $room.remoteVideo as track (track.sid)}
		<VideoTrack {track} width={widthBasis} height={heightBasis} {aspectRatio} />
	{/each}
	<span id="remoteAudio" />
	{#each $room.remoteAudio as track (track.sid)}
		<AudioTrack {track} />
	{/each}
</div>
<div class="overlay">
	<div
		class="control"
		on:mouseover={() => {
			showVideoDevices = true;
		}}
		on:mouseleave={() => {
			showVideoDevices = false;
		}}
	>
		{#if showVideoDevices}
			<div class="devices">
				{#each $room.videoDevices as device}
					<div
						class={`device ${device.deviceId === $room.room.getActiveDevice("videoinput") ? "selected" : ""}`}
						on:click={() => {
							$room.room.switchActiveDevice(device.kind, device.deviceId);
							showVideoDevices = false;
						}}
					>
						{device.label}
					</div>
				{/each}
			</div>
		{/if}
		<div class="icon" on:click={() => (videoEnabled = !videoEnabled)}>
			{#if videoEnabled}<Camera />{:else}<CameraSlash />{/if}
		</div>
	</div>
	<div
		class="control"
		on:mouseenter={() => {
			showAudioDevices = true;
		}}
		on:mouseleave={() => {
			showAudioDevices = false;
		}}
	>
		{#if showAudioDevices}
			<div class="devices">
				{#each $room.audioDevices as device}
					<div
						class={`device ${device.deviceId === $room.room.getActiveDevice("audioinput") ? "selected" : ""}`}
						on:click={() => {
							$room.room.switchActiveDevice(device.kind, device.deviceId);
							showAudioDevices = false;
						}}
					>
						{device.label}
					</div>
				{/each}
			</div>
		{/if}
		<div class="icon" on:click={() => (audioEnabled = !audioEnabled)}>
			{#if audioEnabled}<Microphone />{:else}<MicrophoneSlash />{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.overlay {
		position: fixed;
		bottom: 0;
		padding: 16px;
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: flex-end;
		justify-content: center;
		gap: 16px;
		.control {
			position: relative;
			border-radius: 8px;
			background-color: #333333;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			padding: 8px 16px;
			.icon {
				color: white;
				display: flex inline;
				align-items: center;
				justify-content: center;
			}
			.devices {
				position: absolute;
				display: flex;
				flex-direction: column;
				min-width: 250px;
				max-width: 300px;
				bottom: 48px;
				background-color: #333333;
				border-radius: 8px;
				padding: 8px;

				.device {
					color: white;
					padding: 8px;
					cursor: pointer;
					text-overflow: ellipsis;
					text-wrap: nowrap;
					overflow: hidden;
					&:hover {
						background-color: #444444;
					}
					&.selected {
						background-color: #555555;
					}
				}
			}
		}
	}
	.videoContainer {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
