var _AitmedApps_apps, _AitmedApps_aggregators;
import { __classPrivateFieldGet } from "tslib";
import dotenv from 'dotenv';
dotenv.config();
import * as u from '@jsmanifest/utils';
import NoodlAggregator from 'noodl-aggregator';
import chalk from 'chalk';
const tag = `[${chalk.keyword('navajowhite')('apps')}]`;
function throwError(err) {
    if (err instanceof Error)
        throw err;
    throw new Error(err);
}
const TOKEN = process.env.GITLAB_TOKEN;
const headers = {
    'PRIVATE-TOKEN': TOKEN,
};
const baseConfigUrl = 'https://public.aitmed.com/config';
function createAppObject(config = '') {
    config.startsWith('/') && (config = config.substring(1));
    const pathname = `/${config.replace(/\//g, '')}`;
    return {
        config,
        url: `${baseConfigUrl}${pathname}`,
        pathname,
        data: null,
    };
}
class AitmedApps {
    constructor(apps) {
        _AitmedApps_apps.set(this, new Map());
        _AitmedApps_aggregators.set(this, new Map());
        this.load(apps);
    }
    async load(apps) {
        try {
            const loadedApps = await Promise.allSettled(u.array(apps).map(async (config) => {
                try {
                    const appObject = createAppObject(config);
                    __classPrivateFieldGet(this, _AitmedApps_apps, "f").set(config, appObject);
                    const aggregator = new NoodlAggregator(config);
                    __classPrivateFieldGet(this, _AitmedApps_aggregators, "f").set(config, aggregator);
                    await aggregator.init({ loadPages: true, loadPreloadPages: true });
                    return {
                        aggregator,
                        appObject,
                        config,
                    };
                }
                catch (error) {
                    throwError(error);
                }
            }));
            for (const app of loadedApps) {
                if (app.status === 'fulfilled') {
                    const { aggregator, appObject, config } = app.value;
                }
                else if (app.status === 'rejected') {
                    const { reason } = app;
                }
            }
        }
        catch (error) {
            throwError(error);
        }
    }
}
_AitmedApps_apps = new WeakMap(), _AitmedApps_aggregators = new WeakMap();
export default AitmedApps;
//# sourceMappingURL=AitmedApps.js.map