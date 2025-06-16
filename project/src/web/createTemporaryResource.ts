import type {CreateTemporaryResourceOptions} from "#~export/CreateTemporaryResourceOptions.ts"
import type {TemporaryResource} from "#~export/TemporaryResource.ts"
import type {GlobalState} from "#~src/GlobalState.ts"
import type {Dependencies} from "#~src/Dependencies.ts"
import {isString} from "@anio-software/pkg.is"

export function web_createTemporaryResource(
	globalState: GlobalState,
	dependencies: NonNullable<Dependencies["web"]>,
	data: string,
	options?: CreateTemporaryResourceOptions
): TemporaryResource {
	const blob: Blob = (() => {
		if (isString(options?.web?.mimeType)) {
			return new Blob([data], {
				type: options.web.mimeType
			})
		}

		return new Blob([data])
	})()

	const location = URL.createObjectURL(blob)

	return {
		resourceURL: location,
		cleanup: () => {
			try {
				URL.revokeObjectURL(location)
			} catch {}
		}
	}
}
