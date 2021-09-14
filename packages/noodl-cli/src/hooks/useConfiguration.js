import React from 'react';
import fs from 'fs-extra';
import * as com from 'noodl-common';
import store from '../store.js';
import * as c from '../constants.js';
function useConfiguration({ cli, onInit }) {
    const clear = React.useCallback(store.clear, []);
    const getAll = React.useCallback(() => store.all, []);
    const getDefaultGenerateDir = React.useCallback(() => com.getAbsFilePath(c.DEFAULT_OUTPUT_DIR), []);
    const getPathToGenerateDir = React.useCallback(() => {
        return store.get(c.GENERATE_DIR_KEY) || '';
    }, []);
    const setPathToGenerateDir = React.useCallback((path, opts) => {
        store.set(c.GENERATE_DIR_KEY, path === 'default' ? getDefaultGenerateDir() : com.getAbsFilePath(path));
        const pathToGenerateDir = getPathToGenerateDir();
        refreshLastUpdatedTimestamp();
        if (!fs.existsSync(pathToGenerateDir)) {
            try {
                fs.ensureDirSync(pathToGenerateDir);
                opts?.onCreated?.(pathToGenerateDir);
            }
            catch (error) {
                opts?.onError?.({
                    error: error,
                    path: pathToGenerateDir,
                });
            }
        }
        return pathToGenerateDir;
    }, []);
    const isFresh = React.useCallback(() => !store.has('timestamp'), []);
    const initTimestamp = React.useCallback(() => {
        store.set('timestamp', new Date().toISOString());
        return store.get('timestamp');
    }, []);
    const getLastUsedConfigKey = React.useCallback(() => store.get('configKey'), []);
    const refreshLastUpdatedTimestamp = React.useCallback(() => {
        store.set('lastUpdated', new Date().toISOString());
        return store.get('lastUpdated');
    }, []);
    const getTempDir = React.useCallback(() => cli.flags.out, []);
    React.useEffect(() => {
        //
    }, []);
    return {
        clear,
        getAll,
        getDefaultGenerateDir,
        getLastUsedConfigKey,
        getPathToGenerateDir,
        getTempDir,
        initTimestamp,
        isFresh,
        refreshLastUpdatedTimestamp,
        setPathToGenerateDir,
    };
}
export default useConfiguration;
//# sourceMappingURL=useConfiguration.js.map