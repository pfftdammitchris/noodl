/// <reference types="react" />
declare function Settings({ onReady, pathToOutputDir, tempDir, }: {
    onReady?(): void;
    pathToOutputDir?: string;
    tempDir?: string;
}): JSX.Element;
export default Settings;
