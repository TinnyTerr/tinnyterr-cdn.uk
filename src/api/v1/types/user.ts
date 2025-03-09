import type { UUID } from "node:crypto";

/**
 * A hash, commonly HS512
 */
type Hash = string;

export default interface User {
	username: string;
	password: Hash;
	uuid: UUID;
}
