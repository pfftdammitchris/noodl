import type JsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getPDFInstance, getNextHeight, getProps } from './utils'
import * as t from './types'

class PdfDocs {
	pdf: InstanceType<typeof JsPDF>

	constructor(jsPDF: InstanceType<typeof JsPDF>) {
		this.pdf = jsPDF
	}

	async createPages(el: HTMLElement | null) {
		try {
			const {
				bounds,
				format,
				height,
				orientation,
				originalScrollPosition,
				overallHeight,
				pdfSetting,
				width,
				x,
				y,
			} = getProps(el)

			if (el.children.length) {
				let index = 0
				let currHeight = 0
				let currPageHeight = 0
				let numChildren = el.children.length
				let pageBeginNode = el.children[0]
				let pendingIds = [] as string[]

				for (let index = 0; index < numChildren; index++) {
					let childNode = el.children[index] as HTMLElement
					let childBounds = childNode.getBoundingClientRect()
					let nextHeight = getNextHeight(currPageHeight, childBounds)
					let position

					pageBeginNode.scrollIntoView()

					let canvas = await html2canvas(childNode, {
						allowTaint: true,
						width,
						height,
						windowWidth: window.innerWidth,
						windowHeight: window.innerHeight,
						logging: true,
						onclone: (doc, container) => {
							let numChildren = container.children.length
							debugger
							console.log('hLELOL')
							for (let index = 0; index < numChildren; index++) {
								const childNode = container.children[index] as HTMLElement
								const height = childNode.getBoundingClientRect().height
								// const position = getElementTop(childNode)
								const positionWithHeight = position + height
								const removeBeforePosition = currHeight - currPageHeight
								const removeAfterPosition = currHeight + currPageHeight
								const willOverflow = position > currHeight

								if (
									willOverflow ||
									position < removeBeforePosition ||
									position > removeAfterPosition
								) {
									console.log(
										`%c[Removing] ${childNode.tagName} - ${childNode.id}`,
										`color:mediumslategreen;font-weight:bold;`,
										childNode.textContent.slice(0, 200),
									)

									childNode.style.visibility = 'hidden'

									if (
										positionWithHeight > removeAfterPosition &&
										!pendingIds.includes(childNode.id)
									) {
										pendingIds.push(childNode.id)
									}
								} else {
									if (pendingIds.includes(childNode.id)) {
										pendingIds.splice(pendingIds.indexOf(childNode.id), 1)
									}
								}
							}
						},
						scrollX: childNode.scrollLeft,
						scrollY: childNode.scrollTop,
						useCORS: false,
						x: childBounds.x,
						y: childBounds.y,
					})

					this.pdf.addPage(format, orientation)
					this.pdf.addImage(canvas, 'PNG', 0, 0, canvas.width, canvas.height)

					currPageHeight = 0
					pageBeginNode = childNode
				}
			} else {
				const canvas = await html2canvas(el, {
					width,
					height,
					windowHeight: height,
				})

				this.pdf.addPage(format, orientation)
				this.pdf.addImage(canvas, 'PNG', 0, 0, width, height)
			}

			el.scrollTo({ top: originalScrollPosition })

			return this.pdf
		} catch (error) {
			if (error instanceof Error) throw error
			throw new Error(String(error))
		}
	}
}

export default PdfDocs
