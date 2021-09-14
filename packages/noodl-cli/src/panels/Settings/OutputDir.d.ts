/// <reference types="react" />
export interface OutputDirProps {
    value: string;
    onConfirm?(): void;
}
declare function OutputDir({ onConfirm, value }: OutputDirProps): JSX.Element | null;
export default OutputDir;
