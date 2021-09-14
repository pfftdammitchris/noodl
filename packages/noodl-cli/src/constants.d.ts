export declare const DEFAULT_OUTPUT_DIR = "generated";
export declare const DEFAULT_CONFIG_HOSTNAME = "public.aitmed.com";
export declare const DEFAULT_CONFIG = "aitmed";
export declare const DEFAULT_SERVER_HOSTNAME = "127.0.0.1";
export declare const DEFAULT_SERVER_PATH = "server";
export declare const DEFAULT_SERVER_PORT = 3001;
export declare const DEFAULT_SERVER_PROTOCOL = "http";
export declare const DEFAULT_WSS_PORT = 3002;
export declare const DEFAULT_PANEL = "select";
export declare const app: {
    readonly INITIAL_OPTION: "INITIAL_OPTION";
    readonly action: {
        readonly HIGHLIGHT_PANEL: "HIGHLIGHT_PANEL";
        readonly SET_CAPTION: "SET_CAPTION";
        readonly SET_SERVER_OPTIONS: "SET_SERVER_OPTIONS";
        readonly SET_OBJECTS_JSON_OPTIONS: "SET_OBJECTS_JSON_OPTIONS";
        readonly SET_OBJECTS_YML_OPTIONS: "SET_OBJECTS_YML_OPTIONS";
        readonly SET_PANEL: "SET_PANEL";
        readonly SET_SPINNER: "SET_SPINNER";
    };
};
export declare const GENERATE_DIR_KEY = "generateDir";
declare const _panel: {
    readonly RETRIEVE_OBJECTS: {
        readonly label: "Retrieve objects";
    };
    readonly RETRIEVE_KEYWORDS: {
        readonly label: "Retrieve keywords";
    };
    readonly SERVER_FILES: {
        readonly label: "Retrieve all necessary files referenced in a config";
    };
    readonly RUN_SERVER: {
        readonly label: "Run the server";
    };
};
export declare const panel: Record<"RETRIEVE_OBJECTS" | "RETRIEVE_KEYWORDS" | "SERVER_FILES" | "RUN_SERVER", ({
    readonly label: "Retrieve objects";
} | {
    readonly label: "Retrieve keywords";
} | {
    readonly label: "Retrieve all necessary files referenced in a config";
} | {
    readonly label: "Run the server";
}) & {
    value: keyof typeof _panel;
}>;
export declare const placeholder: {
    readonly cadlBaseUrl: "\\${cadlBaseUrl}";
    readonly cadlVersion: "\\${cadlVersion}";
    readonly designSuffix: "\\${designSuffix}";
};
export {};
