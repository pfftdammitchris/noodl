import React from 'react'
import { Text } from 'ink'
import InkSelectInput, { ItemProps } from 'ink-select-input'

// @ts-expect-error
const SelectInput = InkSelectInput.default as typeof InkSelectInput

export interface SelectInputProps {
	indicatorComponent?: (args: {
		children?: React.ReactNode
		isSelected?: boolean | undefined
	}) => React.ReactElement<any, any> | null
	indicatorColor?: string
	items: { key?: string; value: any; label: string }[]
	isSelected?: boolean
	isFocused?: boolean
	initialIndex?: number
	itemComponent?: React.FC<ItemProps>
	limit?: number
	onHighlight?(item: ItemProps): void
	onSelect?(item: ItemProps): void
}

const Select = ({
	indicatorColor = 'magentaBright',
	isSelected,
	items = [],
	...rest
}: SelectInputProps) => {
	return (
		<SelectInput
			indicatorComponent={({ children, isSelected }) => (
				<Text color={isSelected ? indicatorColor : undefined}>
					{isSelected ? '>' : ' '} {children}
				</Text>
			)}
			initialIndex={0}
			items={items}
			{...rest}
		/>
	)
}

export default Select
