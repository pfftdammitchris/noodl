import React from 'react';
import { Text } from 'ink';
import InkSelectInput from 'ink-select-input';
// @ts-expect-error
const SelectInput = InkSelectInput.default;
const Select = ({ indicatorColor = 'magentaBright', isSelected, items = [], ...rest }) => {
    return (React.createElement(SelectInput, { indicatorComponent: ({ children, isSelected }) => (React.createElement(Text, { color: isSelected ? indicatorColor : undefined },
            isSelected ? '>' : ' ',
            " ",
            children)), initialIndex: 0, items: items, ...rest }));
};
export default Select;
//# sourceMappingURL=Select.js.map