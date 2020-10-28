import { AxiosError } from 'axios';
export declare const createConfigURL: (configKey: string) => string;
export declare function prettifyErr(err: AxiosError | Error): string;
