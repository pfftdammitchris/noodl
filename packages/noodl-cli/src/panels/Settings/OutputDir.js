import React from 'react';
import { Box, Text } from 'ink';
import Select from '../../components/Select.js';
import useCtx from '../../useCtx.js';
function OutputDir({ onConfirm, value }) {
    const [done, setDone] = React.useState(false);
    const { configuration } = useCtx();
    React.useEffect(() => {
        if (value && !done) {
            configuration.setPathToGenerateDir(value);
            setDone(true);
        }
    }, [done, value]);
    if (done) {
        return (React.createElement(Box, { flexDirection: "column" },
            React.createElement(Text, { color: "white" },
                "Output directory was set to",
                ' ',
                React.createElement(Text, { color: "yellow" }, configuration.getPathToGenerateDir())),
            React.createElement(Box, { paddingTop: 1 },
                React.createElement(Select, { items: [{ value: 'ok', label: 'Ok' }], onSelect: onConfirm }))));
    }
    return null;
}
export default OutputDir;
//# sourceMappingURL=OutputDir.js.map