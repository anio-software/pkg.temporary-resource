export type TemporaryResource = {
	resourceURL: string
	cleanup: () => undefined
}
