/**
 * Returns true if value is an image extension or mime type
 * @param string value
 * @returns boolean
 */
function isImage(value: string | undefined) {
	return (
		typeof value === 'string' &&
		/([.\/]|image)*(bmp|gif|jpg|jpeg|png|svg|tif)$/i.test(value)
	)
}

export default isImage
