import * as u from '@jsmanifest/utils';
import yaml from 'yaml';
function forEach(value, fn) {
    if (yaml.isSeq(value)) {
        value.items.forEach((item, i, coll) => fn(item, i, coll));
    }
    else if (u.isArr(value)) {
        value.forEach(fn);
    }
}
export default forEach;
//# sourceMappingURL=forEach.js.map