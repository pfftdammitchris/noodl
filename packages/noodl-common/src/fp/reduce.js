import * as u from '@jsmanifest/utils';
import yaml from 'yaml';
function reduce(value, fn, initialValue) {
    if (yaml.isSeq(value))
        return u.reduce(value.items, fn, initialValue);
    return u.reduce(value, fn, initialValue);
}
export default reduce;
//# sourceMappingURL=reduce.js.map