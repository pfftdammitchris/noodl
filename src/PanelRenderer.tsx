import React from 'react'
import SelectRoute from './panels/SelectRoute'
import RetrieveObjects from './panels/RetrieveObjects'
import { PanelId } from './types'

export interface PanelRendererProps {
	id?: PanelId
	label?: string
	default?(): React.ReactNode
}

function PanelRenderer({ id }: PanelRendererProps) {
	switch (id) {
		case 'select-route':
			return <SelectRoute />
		case 'fetch-objects':
			return <RetrieveObjects />
		default:
			return null
	}
}

export default PanelRenderer
