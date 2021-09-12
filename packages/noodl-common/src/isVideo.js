"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns true if value is a video extension or mime type
 * @param { string } value
 * @returns { boolean }
 */
function isVideo(value = '') {
    return (typeof value === 'string' &&
        /([./]|video)*(avi|flac|flv|mkv|mp4|mpg|ogg|wmv)$/i.test(value));
}
exports.default = isVideo;
//# sourceMappingURL=isVideo.js.map