/// <reference types="react" />
export interface Props {
    config?: string;
    configVersion?: string;
    isLocal?: boolean;
    port?: number;
    onEnd?(): void;
    isTemp?: boolean;
}
export declare const initialState: {
    configKey: string;
    assets: {
        status: 'downloading' | 'downloaded' | 'does-not-exist';
    }[];
};
declare function GenerateApp(props: Props): JSX.Element;
export default GenerateApp;
