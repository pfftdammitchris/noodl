import React from 'react';
import InkTextInput from 'ink-text-input';
export declare type TextProps = Partial<typeof InkTextInput['defaultProps']> & {
    children?: React.ReactNode;
};
declare function TextInput({ children, ...rest }: TextProps): JSX.Element;
export default TextInput;
