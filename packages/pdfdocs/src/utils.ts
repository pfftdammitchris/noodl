import type JsPDF from 'jspdf'
import { Orientation } from './types'

export function getNextHeight(currPageHeight: number, bounds: DOMRect) {
	return currPageHeight + bounds.height
}

export function getPDFInstance(
	jsPDF: typeof JsPDF,
	bounds: DOMRect | HTMLElement,
) {
	isElement(bounds) && (bounds = bounds.getBoundingClientRect())
	return new jsPDF({
		compress: true,
		format: [bounds.width, bounds.height],
		orientation: bounds.width > bounds.height ? 'landscape' : 'portrait',
		unit: 'px',
	})
}

export function getProps(el: HTMLElement) {
	const bounds = el.getBoundingClientRect()
	return {
		bounds,
		x: bounds.x,
		y: bounds.y,
		height: bounds.height,
		width: bounds.width,
		format: [bounds.width, bounds.height],
		orientation: (bounds.width > bounds.height
			? 'landscape'
			: 'portrait') as Orientation,
		originalScrollPosition: el.scrollTop,
		overallHeight: el.scrollHeight,
		pdfSetting: {
			pageWidth: bounds.width,
			pageHeight: bounds.height,
		},
	}
}

export function isElement(value: unknown): value is HTMLElement {
	return value !== null && typeof value === 'object' && 'tagName' in value
}
