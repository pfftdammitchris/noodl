function isRefNode(value) {
    return (typeof value !== null &&
        typeof value === 'object' &&
        'type' in (value || {}) &&
        value?.type === 'REFERENCE');
}
export default isRefNode;
//# sourceMappingURL=isRefNode.js.map