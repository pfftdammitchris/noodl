import React from 'react';
import merge from 'lodash/merge.js';
import { produce } from 'immer';
import downloadFile from 'download';
import * as u from '@jsmanifest/utils';
import * as co from '../utils/color.js';
const initialState = {
    initiating: {},
    downloading: {},
    downloaded: {},
    urlsInProgress: [],
    urlsDownloaded: [],
};
function useDownload({ onDownloadProgress: onDownloadProgressProp, onError: onErrorProp, onEnd: onEndProp, onResponse: onResponseProp, options: optionsProp, } = {}) {
    const [state, _setState] = React.useState(initialState);
    const setState = React.useCallback((fn) => {
        _setState(produce((draft) => {
            typeof fn === 'function' ? fn(draft) : merge(draft, fn);
        }));
    }, []);
    const download = React.useCallback(async ({ destination = '', label = '', prefix = '', url = '', onDownloadProgress, onEnd, onError, onResponse, options, }) => {
        try {
            setState((draft) => {
                const urls = [...draft.urlsInProgress, ...draft.urlsDownloaded];
                const downloadObject = { url, state: 'downloading' };
                if (!urls.includes(url)) {
                    draft.initiating[url] = downloadObject;
                }
            });
            let progress;
            try {
                progress = downloadFile(url, destination, optionsProp);
            }
            catch (error) {
                console.error(error);
            }
            progress
                ?.on('response', (req) => {
                setState((draft) => {
                    if (draft.initiating[url]) {
                        draft.downloading[url] = {
                            ...draft.initiating[url],
                            state: 'downloading',
                        };
                        delete draft.initiating[url];
                    }
                    draft.urlsInProgress.push(url);
                });
                onResponse?.(req);
                onResponseProp?.(req);
            })
                .on('downloadProgress', (currentProgress) => {
                setState((draft) => {
                    u.assign(draft.downloading[url], currentProgress);
                });
                onDownloadProgress?.({ ...currentProgress, url });
                onDownloadProgressProp?.({ ...currentProgress, url });
            })
                .on('finish', () => {
                setState((draft) => {
                    draft.downloaded[url].state = 'downloaded';
                    delete draft.downloading[url];
                    const index = draft.urlsInProgress.indexOf(url);
                    if (index > -1)
                        draft.urlsInProgress.splice(index, 1);
                    if (!draft.urlsDownloaded.includes(url)) {
                        draft.urlsDownloaded.push(url);
                    }
                });
                onEnd?.();
                onEndProp?.();
            })
                .on('error', (error) => {
                setState((draft) => {
                    if (!draft.downloading[url]) {
                        draft.downloading[url] = { url };
                    }
                    draft.downloading[url].state = 'error';
                    const index = draft.urlsInProgress.indexOf(url);
                    if (index > -1)
                        draft.urlsInProgress.splice(index, 1);
                });
                onError?.({ error, url });
                onErrorProp?.({ error, url });
            });
            await progress;
        }
        catch (error) {
            if (/(404|not found)/i.test(error.message)) {
                console.error(`[${co.red(`Not Found`)}] ${co.yellow(url)}`);
            }
            else {
                console.error(`[${co.red(label || url)}] ${co.yellow(error.message)}`);
            }
        }
    }, []);
    React.useEffect(() => {
        //
    }, []);
    return {
        ...state,
        download,
    };
}
export default useDownload;
//# sourceMappingURL=useDownload.js.map