import {node_createTemporaryResource} from "#~src/node/createTemporaryResource.ts"
import {web_createTemporaryResource} from "#~src/web/createTemporaryResource.ts"
import type {GlobalState} from "#~src/GlobalState.ts"
import type {CreateTemporaryResourceOptions} from "./CreateTemporaryResourceOptions.ts"
import type {TemporaryResource} from "./TemporaryResource.ts"

type CreateTemporaryResourceFromStringSync = (
	data: string, options?: CreateTemporaryResourceOptions
) => TemporaryResource

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

export function createTemporaryResourceFromStringSyncFactory(
	nodeRequire: NodeJS.Require | undefined
): CreateTemporaryResourceFromStringSync {
	return function(data, options?) {
		if (typeof nodeRequire === "function") {
			return node_createTemporaryResource(
				globalState, {
					process: nodeRequire("node:process"),
					crypto: nodeRequire("node:crypto"),
					fs: nodeRequire("node:fs"),
					os: nodeRequire("node:os"),
					path: nodeRequire("node:path")
				}, data, options
			)
		}

		return web_createTemporaryResource(globalState, {}, data, options)
	}
}
