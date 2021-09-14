import React from 'react';
export interface PanelProps {
    header?: string | {
        color?: string;
        value: string;
    };
    newline?: boolean;
    children?: React.ReactNode;
}
declare function Panel({ children, newline, header }: PanelProps): JSX.Element;
export default Panel;
