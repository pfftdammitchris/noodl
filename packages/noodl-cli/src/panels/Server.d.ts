/// <reference types="react" />
export interface Props {
    config: string;
    isConfigFromServerFlag: boolean;
    host?: string;
    isRemote?: boolean;
    port?: number;
    wss?: {
        port?: number;
    };
    watch?: boolean;
}
declare function Server({ config: initialConfigValue, host, isRemote, port, watch: enableWatch, wss: wssProp, }: Props): JSX.Element | null;
export default Server;
