import orderBy from 'lodash/orderBy';
import isPlainObject from 'lodash/isPlainObject';
import chalk from 'chalk';
import Aggregator from './modules/Aggregator';
import Saver from './modules/Saver';
import { sortObjByProperties } from './utils/common';
import { forEachDeepEntries, } from '../src/utils/common';
import * as log from './utils/log';
async function getAllNOODLProperties({ dir, endpoint, filename, }) {
    try {
        const exts = { json: true };
        const saver = new Saver({ dir, exts: { ...exts, yml: false } });
        const aggregator = new Aggregator({ endpoint, ...exts, yml: false });
        const output = {
            overall: {},
            results: {},
        };
        let name;
        let pageCount = 0;
        await aggregator.load();
        const objects = aggregator.objects({
            basePages: false,
        });
        Object.entries(objects).forEach(([pageName, page]) => {
            pageCount++;
            name = pageName;
            forEachDeepEntries(page[pageName], (key) => {
                if (/^[a-zA-Z]+$/i.test(key)) {
                    if (typeof output.results[name] === 'undefined') {
                        output.results[name] = { [key]: 0 };
                    }
                    if (typeof output.results[name][key] === 'undefined') {
                        output.results[name][key] = 0;
                    }
                    output.results[name][key]++;
                    if (typeof output.overall[key] === 'undefined') {
                        output.overall[key] = 0;
                    }
                    output.overall[key]++;
                }
            });
            if (pageName) {
                log.green(`Processed ${chalk.magentaBright(name)}`);
            }
        });
        // Sort the overall counts in descending order to make it easier to read
        {
            const keyValues = Object.entries(output.overall);
            output.overall = {};
            keyValues
                .sort((a, b) => (a[1] > b[1] ? -1 : 1))
                .forEach(([key, count]) => {
                output.overall[key] = count;
            });
        }
        // Sort the output results to make it easier to read
        orderBy(Object.keys(output.results)).forEach((filename) => {
            // If the value is nested object (second level)
            if (isPlainObject(output.results[filename])) {
                output.results[filename] = sortObjByProperties(output.results[filename]);
            }
        });
        await saver.save({
            data: sortObjByProperties(output),
            dir,
            filename,
            type: 'json',
        });
        return { pageCount };
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
export default getAllNOODLProperties;
//# sourceMappingURL=getAllProperties.js.map