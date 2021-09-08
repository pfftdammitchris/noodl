import * as u from '@jsmanifest/utils'
import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'

const graphqlEndpoint = 'https://rational-dingo-60.hasura.app/v1/graphql'
const graphqlApi = 'https://ecos-noodl.hasura.app/v1/graphql'
const adminSecret =
	'VzqnFhstCXpdPz6bl76kmALogk8n0dDxAm1Y6DFj2k7xcy25Dpu86HzSq5aG6wQo'
const cloudIp = '54.176.149.52'
const project = {
	name: 'ecos-noodl',
	id: '50b3455b-079d-47ce-9048-4826ea6d8d65',
}
const owner = 'pfftdammitchris@gmail.com'

;(async () => {
	try {
		const response = await axios.get('https://data.pro.hasura.io/v1/graphql')
	} catch (error) {
		console.error(error)
		throw error
	}
})()
