"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggers = exports.REFRESH = exports.trigger = exports.ON_REFRESH = exports.ON_STATUS = exports.ON_ABORT = exports.TIMED_OUT = exports.RESOLVED = exports.PENDING = exports.ERROR = exports.ABORTED = exports.IN_PROGRESS = exports.IDLE = void 0;
// ActionChain statuses
exports.IDLE = 'idle';
exports.IN_PROGRESS = 'in.progress';
exports.ABORTED = 'aborted';
exports.ERROR = 'error';
exports.PENDING = 'pending';
exports.RESOLVED = 'resolved';
exports.TIMED_OUT = 'timed.out';
// ActionChain observe events
exports.ON_ABORT = 'on.abort';
exports.ON_STATUS = 'on.status';
exports.ON_REFRESH = 'on.refresh';
// ActionChain default triggers
exports.trigger = {
    ON_BLUR: 'onBlur',
    ON_CLICK: 'onClick',
    ON_CHANGE: 'onChange',
    ON_HOVER: 'onHover',
    ON_MOUSEENTER: 'onMouseEnter',
    ON_MOUSELEAVE: 'onMouseLeave',
    ON_MOUSEOUT: 'onMouseOut',
    ON_MOUSEOVER: 'onMouseOver',
};
exports.REFRESH = 'refresh';
exports.triggers = Object.values(exports.trigger);
//# sourceMappingURL=constants.js.map