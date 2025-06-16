import type {CreateTemporaryResourceOptions} from "./CreateTemporaryResourceOptions.ts"
import type {TemporaryResource} from "./TemporaryResource.ts"
import type {GlobalState} from "#~src/GlobalState.ts"
import type {Dependencies} from "#~src/Dependencies.ts"
import {isNodeEnvironment} from "@anio-software/pkg.is"
import {node_createTemporaryResource} from "#~src/node/createTemporaryResource.ts"
import {web_createTemporaryResource} from "#~src/web/createTemporaryResource.ts"

const isNode = await isNodeEnvironment()

const globalState: GlobalState = (() => {
	const symbol = Symbol.for("@anio-software/pkg.temporary-resource/state")
	const ctx = globalThis as any

	if (!(symbol in ctx)) {
		const initialGlobalState: GlobalState = {
			cleanupHandlerSet: false,
			cleanupItems: []
		}

		ctx[symbol] = initialGlobalState
	}

	return ctx[symbol]
})()

const dependencies: Dependencies = await (async () => {
	if (isNode) {
		return {
			node: {
				"fs": (await import("node:fs")).default,
				"os": (await import("node:os")).default,
				"path": (await import("node:path")).default,
				"crypto": (await import("node:crypto")).default,
				"process": (await import("node:process")).default
			}
		}
	}

	return {
		web: {}
	}
})()

export function createTemporaryResourceFromStringSync(
	data: string,
	options?: CreateTemporaryResourceOptions
): TemporaryResource {
	if (isNode) {
		return node_createTemporaryResource(
			globalState, dependencies.node!, data, options
		)
	}

	return web_createTemporaryResource(
		globalState, dependencies.web!, data, options
	)
}
