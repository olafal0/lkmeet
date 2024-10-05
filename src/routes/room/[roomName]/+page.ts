import type { JoinResponse } from "../../api/join/+server";
import type { PageLoad } from "./$types";
import { v4 as uuidv4 } from "uuid";

export const load: PageLoad = async ({ fetch, params }) => {
	const { roomName } = params;
	const joinRes: JoinResponse = await fetch(`/api/join`, {
		method: "POST",
		body: JSON.stringify({ roomName, participantName: "Test", identity: uuidv4() }),
	}).then((r) => r.json());
	return {
		roomName,
		joinToken: joinRes.joinToken,
		serverUrl: joinRes.serverUrl,
	};
};
