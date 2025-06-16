export type Dependencies = {
	node?: {
		"fs": typeof import("node:fs")
		"os": typeof import("node:os")
		"path": typeof import("node:path")
		"crypto": typeof import("node:crypto")
		"process": typeof import("node:process")
	}

	web?: {

	}
}
