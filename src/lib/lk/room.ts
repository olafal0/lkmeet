import { browser } from "$app/environment";
import {
	LocalVideoTrack,
	RemoteAudioTrack,
	RemoteVideoTrack,
	Room,
	RoomEvent,
} from "livekit-client";
import { readable } from "svelte/store";

export interface RoomStore {
	room: Room;
	localVideo: LocalVideoTrack | null;
	remoteVideo: RemoteVideoTrack[];
	remoteAudio: RemoteAudioTrack[];
	videoDevices: MediaDeviceInfo[];
	audioDevices: MediaDeviceInfo[];
	join(serverURL: string, joinToken: string): Promise<void>;
}

export const room = readable(
	{
		room: new Room(),
		localVideo: null,
		remoteVideo: [],
		remoteAudio: [],
		videoDevices: [],
		audioDevices: [],
		join: async () => {},
	} as RoomStore,
	(set, update) => {
		const val = {
			room: new Room(),
			localVideo: null,
			remoteVideo: [],
			remoteAudio: [],
			videoDevices: [],
			audioDevices: [],
			join: async () => {},
		} as RoomStore;

		val.room.on(RoomEvent.LocalTrackPublished, (publication) => {
			if (publication.track && publication.track.kind === "video") {
				update((v) => {
					v.localVideo = publication.track as LocalVideoTrack;
					return v;
				});
			}
		});
		val.room.on(RoomEvent.LocalTrackUnpublished, (publication) => {
			if (publication.track && publication.track.kind === "video") {
				update((v) => {
					v.localVideo = null;
					return v;
				});
			}
		});
		val.room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
			if (participant.sid === val.room.localParticipant.sid) {
				return;
			}
			update((v) => {
				if (track.kind === "video") {
					if (v.remoteVideo.find((t) => t.sid === track.sid)) {
						return v;
					}
					v.remoteVideo.push(track as RemoteVideoTrack);
				} else if (track.kind === "audio") {
					if (v.remoteAudio.find((t) => t.sid === track.sid)) {
						return v;
					}
					v.remoteAudio.push(track as RemoteAudioTrack);
				}
				return v;
			});
		});
		val.room.on(RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
			if (participant.sid === val.room.localParticipant.sid) {
				return;
			}
			update((v) => {
				if (track.kind === "video") {
					v.remoteVideo = v.remoteVideo.filter((t) => t.sid !== track.sid);
				}
				if (track.kind === "audio") {
					v.remoteAudio = v.remoteAudio.filter((t) => t.sid !== track.sid);
				}
				return v;
			});
		});
		val.room.on(RoomEvent.MediaDevicesChanged, async () => {
			const videoDevices = await Room.getLocalDevices("videoinput");
			const audioDevices = await Room.getLocalDevices("audioinput");
			update((v) => {
				v.videoDevices = videoDevices;
				v.audioDevices = audioDevices;
				return v;
			});
		});

		val.join = async (serverURL: string, joinToken: string) => {
			if (browser) {
				await val.room.connect(serverURL, joinToken);
				const videoDevices = await Room.getLocalDevices("videoinput", true);
				const audioDevices = await Room.getLocalDevices("audioinput", true);
				update((v) => {
					v.videoDevices = videoDevices;
					v.audioDevices = audioDevices;
					return v;
				});
			}
		};

		set(val);
		return () => val.room.disconnect();
	},
);
