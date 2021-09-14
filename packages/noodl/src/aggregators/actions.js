import yaml from 'yaml';
export const visit = (fn) => {
    const visitNode = (key, node, path) => {
        return fn({ key, node, path });
    };
    return visitNode;
};
export const handleActionType = visit(({ node }) => {
    //
});
const aggregateActions = function aggregateActions(doc) {
    yaml.visit(doc, {
        Scalar(key, node, path) {
            //
        },
        Pair(key, node, path) {
            //
        },
        Map(key, node, path) {
            //
        },
        Seq(key, node, path) {
            //
        },
    });
};
export default aggregateActions;
//# sourceMappingURL=actions.js.map