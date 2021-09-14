import React from 'react';
import * as u from '@jsmanifest/utils';
import { Box, Newline, Text } from 'ink';
function Panel({ children, newline = true, header }) {
    return (React.createElement(Box, { padding: 1, flexDirection: "column" },
        header &&
            (u.isStr(header) ? (React.createElement(Text, { color: "yellow" }, header)) : (React.createElement(Text, { color: header.color || 'yellow' }, header.value))),
        newline && React.createElement(Newline, null),
        children));
}
export default Panel;
//# sourceMappingURL=Panel.js.map