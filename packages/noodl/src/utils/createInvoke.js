function createInvoke(cb) {
    const invoke = function invoke(o) {
        return cb(o);
    };
    return invoke;
}
export default createInvoke;
//# sourceMappingURL=createInvoke.js.map