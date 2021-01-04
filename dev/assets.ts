import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import yaml from 'yaml'
import download from 'download'
import {
	forEachDeepKeyValue,
	getFilePath,
	isImg,
	isVid,
	isPdf,
} from '../src/utils/common'

export interface PlainObject {
	[key: string]: any
}

export type GetAssetsDataType = string | string[] | PlainObject | PlainObject[]

export interface GetAssetsOptions {
	assetsUrl?: string
	name?: string
}

export async function getAssets(
	data: GetAssetsDataType,
	options?: { assetsUrl?: string; name?: string },
): Promise<string[]>
export async function getAssets<Name extends string = any>(
	data: GetAssetsDataType,
	options?: { assetsUrl?: string; name: Name },
): Promise<{ name: Name; assets: string[] }>
export async function getAssets(
	data: GetAssetsDataType,
	{ assetsUrl = '', name = '' }: GetAssetsOptions = {},
) {
	try {
		const objs = [] as PlainObject[]
		const links = [] as string[]

		const toObj = (d: any) => {
			return objs.push(typeof d === 'string' ? yaml.parse(d) : d)
		}

		if (Array.isArray(data)) {
			data.forEach(toObj)
		} else {
			toObj(data)
		}

		objs.forEach((obj) => {
			forEachDeepKeyValue((key, value) => {
				if (
					typeof value === 'string' &&
					(isImg(value) || isVid(value) || isPdf(value))
				) {
					links.push(`${assetsUrl}${value}`)
				}
			}, obj)
		})

		return name ? { name, links } : links
	} catch (error) {
		throw new Error(error)
	}
}

getAssets(
	fs.readFileSync(getFilePath('./data/generated/yml/TestRedaw.yml'), 'utf8'),
	{ name: 'TestRedaw' },
).then(async (result) => {
	const dl = async (url: string) => {
		console.log(`Downloading: ${chalk.magenta(url)}`)
		await download(url, getFilePath('data/generated/images'))
	}
	if (!Array.isArray(result) && typeof result === 'object') {
		console.log(result)
		const links = result.links
		const numLinks = links.length
		for (let index = 0; index < numLinks; index++) {
			await dl(links[index])
		}
	} else if (Array.isArray(result)) {
		const links = result
		const numLinks = links.length
		for (let index = 0; index < numLinks; index++) {
			await dl(links[index])
		}
	}
})
