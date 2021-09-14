/// <reference types="node" />
import { IncomingMessage } from 'http';
import downloadFile from 'download';
export interface Options {
    options?: downloadFile.DownloadOptions;
    onDownloadProgress?(args: Omit<DownloadObject, 'state'>): void;
    onResponse?(response: IncomingMessage): void;
    onError?(args: {
        error: Error;
        url: string;
    }): void;
    onEnd?(): void;
}
export interface DownloadProgress {
    percent: string;
    total: number;
    transferred: number;
}
export interface DownloadObject extends DownloadProgress {
    state: 'initiating' | 'downloading' | 'downloaded' | 'error';
    url: string;
}
declare function useDownload({ onDownloadProgress: onDownloadProgressProp, onError: onErrorProp, onEnd: onEndProp, onResponse: onResponseProp, options: optionsProp, }?: Options): {
    download: ({ destination, label, prefix, url, onDownloadProgress, onEnd, onError, onResponse, options, }: {
        destination?: string | undefined;
        label?: string | undefined;
        prefix?: string | undefined;
        url: string;
    } & Pick<Options, "options" | "onError" | "onEnd" | "onDownloadProgress" | "onResponse">) => Promise<void>;
    initiating: Record<string, DownloadObject>;
    downloading: Record<string, DownloadObject>;
    downloaded: Record<string, DownloadObject>;
    urlsInProgress: string[];
    urlsDownloaded: string[];
};
export default useDownload;
