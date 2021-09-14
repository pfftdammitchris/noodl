import * as u from '@jsmanifest/utils';
import React from 'react';
import merge from 'lodash/merge.js';
import { produce } from 'immer';
import useCtx from '../useCtx.js';
const initialState = {
    rootConfig: {
        remote: null,
        loading: false,
        loaded: false,
    },
    appConfig: {
        loading: false,
        loaded: false,
    },
};
function useConfigLoader({ dir: dirProp = '' } = {}) {
    const [state, _setState] = React.useState(initialState);
    const { aggregator, log } = useCtx();
    const setState = React.useCallback((fn) => {
        _setState(produce((draft) => {
            if (typeof fn === 'object')
                merge(draft, fn);
            else
                fn(draft);
        }));
    }, []);
    const load = React.useCallback(async (opts) => {
        try {
            let configKey = '';
            let configObject;
            if (u.isStr(opts)) {
                configKey = opts;
            }
            else {
                configKey = opts.configKey;
                configObject = opts.configObject;
            }
        }
        catch (error) {
            console.error(error);
        }
    }, [dirProp]);
    React.useEffect(() => {
        //
    }, []);
    return {
        ...state,
    };
}
export default useConfigLoader;
//# sourceMappingURL=useConfigLoader.js.map