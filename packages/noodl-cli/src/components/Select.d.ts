import React from 'react';
import { ItemProps } from 'ink-select-input';
export interface SelectInputProps {
    indicatorComponent?: (args: {
        children?: React.ReactNode;
        isSelected?: boolean | undefined;
    }) => React.ReactElement<any, any> | null;
    indicatorColor?: string;
    items: {
        key?: string;
        value: any;
        label: string;
    }[];
    isSelected?: boolean;
    isFocused?: boolean;
    initialIndex?: number;
    itemComponent?: React.FC<ItemProps>;
    limit?: number;
    onHighlight?(item: ItemProps): void;
    onSelect?(item: ItemProps): void;
}
declare const Select: ({ indicatorColor, isSelected, items, ...rest }: SelectInputProps) => JSX.Element;
export default Select;
