import type { UUID } from "node:crypto";

export default interface Text {
	_id: UUID;
	uploader: UUID;
	data: string;
	lastUpdated: string;
}
