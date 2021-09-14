function isAction(obj) {
    return !!(obj &&
        !Array.isArray(obj) &&
        typeof obj === 'object' &&
        !('queue' in obj) &&
        ('hasExecutor' in obj || 'executor' in obj));
}
export default isAction;
//# sourceMappingURL=isAction.js.map