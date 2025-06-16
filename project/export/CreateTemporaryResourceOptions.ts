export type CreateTemporaryResourceOptions = {
	web?: {
		mimeType?: string
	}

	node?: {
		fileExtension?: string
		fileMode?: number
	}

	autoCleanup?: boolean
	createAsReadonly?: boolean
}
