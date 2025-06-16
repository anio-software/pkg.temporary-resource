import {createTemporaryResourceFromStringSyncFactory} from "./createTemporaryResourceFromStringSyncFactory.ts"

const nodeRequire: NodeJS.Require | undefined = await (async () => {
	try {
		const {default: nodeModule} = await import("node:module")

		return nodeModule.createRequire(import.meta.url)
	} catch {
		return undefined
	}
})()

export const createTemporaryResourceFromStringSync = createTemporaryResourceFromStringSyncFactory(
	nodeRequire
)
