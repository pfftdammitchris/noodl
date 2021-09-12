"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns true if value is an image extension or mime type
 * @param { string } value
 * @returns { boolean }
 */
function isImage(value) {
    return (typeof value === 'string' &&
        /([./]|image)*(bmp|gif|jpg|jpeg|png|svg|tif)$/i.test(value));
}
exports.default = isImage;
//# sourceMappingURL=isImage.js.map