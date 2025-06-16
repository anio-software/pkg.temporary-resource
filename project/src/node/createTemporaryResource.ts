import type {CreateTemporaryResourceOptions} from "#~export/CreateTemporaryResourceOptions.ts"
import type {TemporaryResource} from "#~export/TemporaryResource.ts"
import type {GlobalState} from "#~src/GlobalState.ts"
import type {Dependencies} from "#~src/Dependencies.ts"
import {isString, isNumber} from "@anio-software/pkg.is"

function cleanupHandler(
	globalState: GlobalState,
	dependencies: NonNullable<Dependencies["node"]>
) {
	const {fs} = dependencies

	while (globalState.cleanupItems.length) {
		const item = globalState.cleanupItems.shift()!
		process.stderr.write(`cleaning ${item}`)
		try {
			fs.unlinkSync(item)
		} catch {}
	}
}

export function node_createTemporaryResource(
	globalState: GlobalState,
	dependencies: NonNullable<Dependencies["node"]>,
	data: string,
	options?: CreateTemporaryResourceOptions
): TemporaryResource {
	const createAsReadonly = options?.createAsReadonly === true

	// don't allow fileMode and createAsReadonly to be set at the same time
	if (isNumber(options?.node?.fileMode)) {
		if (createAsReadonly) {
			throw new Error(
				`It is an error to both specify createAsReadonly and fileMode.`
			)
		}
	}

	// NB: use "process" dependency with dependencies.process
	const {crypto, os, path, fs} = dependencies

	if (!globalState.cleanupHandlerSet) {
		dependencies.process.on("SIGTERM", () => {
			cleanupHandler(globalState, dependencies)
		})

		dependencies.process.on("exit", () => {
			cleanupHandler(globalState, dependencies)
		})

		globalState.cleanupHandlerSet = true
	}

	const location: string = (() => {
		let tmpName = crypto.randomBytes(32).toString("hex")

		if (isString(options?.node?.fileExtension)) {
			tmpName += `${options.node.fileExtension}`
		} else {
			tmpName += `.txt`
		}

		return path.join(os.tmpdir(), tmpName)
	})()

	const fileMode: number = (() => {
		if (isNumber(options?.node?.fileMode)) {
			return options.node.fileMode
		}

		return 0o600
	})()

	// make sure file is created exclusively
	const fd = fs.openSync(location, "wx+", fileMode)

	fs.writeSync(fd, data)
	fs.closeSync(fd)

	//
	// this will never overwrite custom file mode set by user
	// because of the check at the beginning of the function
	//
	if (createAsReadonly) {
		fs.chmodSync(location, 0o400)
	}

	const resolvedLocation = fs.realpathSync(location)

	if (options?.autoCleanup !== false) {
		globalState.cleanupItems.push(resolvedLocation)
	}

	return {
		resourceURL: resolvedLocation,
		cleanup: () => {
			try {
				fs.unlinkSync(resolvedLocation)
			} catch {}
		}
	}
}
