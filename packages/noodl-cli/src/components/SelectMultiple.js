import React from 'react';
import InkSelectMultiple from 'ink-multi-select';
function SelectMultiple({ options, selected, ...rest }) {
    return (React.createElement(InkSelectMultiple, { selected: selected, items: options?.map((option) => ({
            key: typeof option === 'string' ? option : option.value,
            value: typeof option === 'string' ? option : option.value,
            label: typeof option === 'string' ? option : option.label,
        })), ...rest }));
}
export default SelectMultiple;
//# sourceMappingURL=SelectMultiple.js.map