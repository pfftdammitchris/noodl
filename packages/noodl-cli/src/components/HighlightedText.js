import React from 'react';
import { Text } from 'ink';
function HighlightedText({ children, ...rest }) {
    return (React.createElement(Text, { color: "cyan", ...rest }, children));
}
export default HighlightedText;
//# sourceMappingURL=HighlightedText.js.map