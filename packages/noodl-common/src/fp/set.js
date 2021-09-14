import * as u from '@jsmanifest/utils';
import yaml from 'yaml';
import _set from 'lodash.set';
function set(obj, key, value) {
    if (yaml.isMap(obj)) {
        obj.set(key, value);
    }
    else if (u.isObj(obj)) {
        _set(obj, key, value);
    }
}
export default set;
//# sourceMappingURL=set.js.map