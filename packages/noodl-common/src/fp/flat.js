import yaml from 'yaml';
import * as u from '@jsmanifest/utils';
import reduce from './reduce.js';
function flat(value) {
    return reduce(value, (acc, v) => {
        // @ts-expect-error
        if (u.isArr(v))
            acc.push(...flat(v));
        // @ts-expect-error
        if (yaml.isSeq(v))
            acc.push(...v.items);
        return acc;
    }, []);
}
export default flat;
//# sourceMappingURL=flat.js.map