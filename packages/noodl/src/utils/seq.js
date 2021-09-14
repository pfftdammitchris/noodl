import { YAMLMap } from 'yaml';
import { isActionLike, isEmitObject, isGotoObject, isToastObject } from './map';
export function isActionChain(node) {
    return node.items.some((value) => {
        if (value instanceof YAMLMap) {
            return [
                isEmitObject,
                isGotoObject,
                isToastObject,
                isActionLike,
            ].some((fn) => fn(value));
        }
        return false;
    });
}
//# sourceMappingURL=seq.js.map