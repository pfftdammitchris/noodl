import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
function Input() {
    const [query, setQuery] = React.useState('');
    return (React.createElement(Box, null,
        React.createElement(Box, { marginRight: 1 },
            React.createElement(Text, null, "Enter your query:")),
        React.createElement(TextInput, { value: query, onChange: setQuery })));
}
export default Input;
//# sourceMappingURL=Input.js.map