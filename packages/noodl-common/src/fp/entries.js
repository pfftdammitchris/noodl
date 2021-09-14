import * as u from '@jsmanifest/utils';
import { isMap } from 'yaml';
import toString from './base/toString.js';
function entries(value) {
    if (isMap(value)) {
        return value.items.map((item) => [toString(item), item.value]);
    }
    else if (u.isObj(value)) {
        return u.entries(value);
    }
    return [];
}
export default entries;
//# sourceMappingURL=entries.js.map