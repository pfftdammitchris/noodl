import isAction from './isAction';
function isActionChain(obj) {
    return !!(obj &&
        typeof obj === 'object' &&
        !isAction(obj) &&
        ('queue' in obj || 'loadQueue' in obj));
}
export default isActionChain;
//# sourceMappingURL=isActionChain.js.map