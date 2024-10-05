import { json } from "@sveltejs/kit";
import { AccessToken } from "livekit-server-sdk";
import type { RequestHandler } from "./$types";
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } from "$env/static/private";

export interface JoinRequest {
	roomName: string;
	participantName: string;
	identity: string;
}

export interface JoinResponse {
	joinToken: string;
	serverUrl: string;
}

export const POST: RequestHandler = async ({ request: req }) => {
	const { roomName, participantName, identity } = await req.json();
	const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
		identity,
		name: participantName,
		// Token to expire after 10 minutes
		ttl: 60 * 10, // Seconds
	});
	at.addGrant({ roomJoin: true, room: roomName });
	const token = await at.toJwt();

	const res: JoinResponse = {
		joinToken: token,
		serverUrl: LIVEKIT_URL || "",
	};
	return json(res);
};
