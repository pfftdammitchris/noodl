import React from 'react';
import InkTextInput from 'ink-text-input';
const TextInputComponent = 
// @ts-expect-error
InkTextInput.default;
function TextInput({ children, ...rest }) {
    return React.createElement(TextInputComponent, { ...rest }, children);
}
export default TextInput;
//# sourceMappingURL=TextInput.js.map