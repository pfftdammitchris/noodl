import React from 'react'
import { Text } from 'ink'
import SelectInput from 'ink-select-input'

export type SelectInputProps = Parameters<typeof SelectInput>[0] & {
	indicatorColor?: string
}

function Select({
	indicatorColor = 'magentaBright',
	isSelected,
	items = [],
	...rest
}: {
	isSelected?: boolean
} & SelectInputProps) {
	// const [highlightedItem, setHighlightedItem] = React.useState(
	// 	items[0]?.value || '',
	// )

	// const onHighlight = React.useCallback((item) => {
	// 	setHighlightedItem(item.value)
	// }, [])

	return (
		<SelectInput
			indicatorComponent={({ children, isSelected }) => (
				<Text color={isSelected ? indicatorColor : undefined}>
					{isSelected ? '>' : ' '} {children}
				</Text>
			)}
			// onHighlight={onHighlight}
			initialIndex={0}
			items={items}
			{...rest}
		/>
	)
}

export default Select
