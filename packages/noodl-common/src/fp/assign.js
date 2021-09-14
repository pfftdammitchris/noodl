import * as u from '@jsmanifest/utils';
import yaml, { YAMLMap } from 'yaml';
import forEach from './forEach.js';
import set from './set.js';
function toMap(value) {
    if (yaml.isMap(value))
        return value;
    if (u.isObj(value)) {
        const map = new YAMLMap();
        u.entries(value).forEach(([k, v]) => map.set(k, v));
        return map;
    }
    return new yaml.Document(value).contents;
}
function assign(value, ...rest) {
    if (yaml.isMap(value)) {
        forEach(value, (item) => 
        // @ts-expect-error
        set(value, yaml.isScalar(item) ? item : String(item), toMap(item.value)));
    }
    else if (u.isObj(value)) {
        u.assign(value, ...rest);
    }
    return value;
}
export default assign;
//# sourceMappingURL=assign.js.map