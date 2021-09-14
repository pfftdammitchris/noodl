export const entry: string;
export const externals: any[];
export const mode: string;
export namespace optimization {
    const minimize: boolean;
}
export namespace devServer {
    const proxy: {
        "/.netlify": {
            target: string;
            pathRewrite: {
                "^/.netlify/functions": string;
            };
        };
    };
}
export namespace module {
    const rules: {
        test: RegExp;
        loader: string;
        options: {
            loader: string;
            target: string;
        };
    }[];
}
