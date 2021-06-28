/**
 * Returns true if value is a video extension or mime type
 * @param string value
 * @returns boolean
 */
function isVideo(value: string | undefined) {
	return (
		typeof value === 'string' &&
		/([.\/]|video)*(avi|flac|flv|mkv|mp4|mpg|ogg|wmv)$/i.test(value)
	)
}

export default isVideo
