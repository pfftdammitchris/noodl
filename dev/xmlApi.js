require('dotenv').config()
const u = require('@jsmanifest/utils')
const chalk = require('chalk')
const chunk = require('lodash/chunk')
const { XMLParser } = require('fast-xml-parser')
/** @type { axios.Axios } */
const axios = require('axios')
const fs = require('fs-extra')
const path = require('path')
const { fetchAssetMetadata } = require('noodl')
const prettyBytes = require('pretty-bytes')

const xmlParser = new XMLParser()

function createS3XmlReader({
  baseUrl = 'https://s3.us-east-2.amazonaws.com',
  endpoint: endpointProp = 'public.aitmed.com',
} = {}) {
  const createUrl = (pathname = '') => `https://public.aitmed.com/${pathname}`
  const endpoint = `${baseUrl}/${endpointProp}`
  const isKey = (o) => o?.name === 'Key'
  const isImg = (s) => /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i.test(s)
  const isVid = (s) => /([a-z\-_0-9\/\:\.]*\.(mp4|avi|wmv))/i.test(s)
  const isYml = (s = '') => s.endsWith('.yml')
  const isJson = (s = '') => s.endsWith('.json')
  const headers = { 'Content-Type': 'application/xml' }

  const filterImage = (obj) => obj?.url || ''
  const filterModifiedDate = (obj) => obj?.modifiedAt || ''
  const filterSize = (obj) => obj?.size || ''

  /**
   * @returns  { Promise<{ Key: string LastModified: string ETag: string Size: number StorageClass: string }[]> }
   */
  const getS3Objects = async () => {
    try {
      const { data: xml } = await axios.get(endpoint, { headers })
      const { ListBucketResult } = xmlParser.parse(xml)
      return ListBucketResult.Contents
    } catch (error) {
      console.log(`[${chalk.red(error.name)}]: ${error.message}`)
    }
  }

  const o = {
    baseUrl,
    createUrl,
    endpoint,
    filterImage,
    filterModifiedDate,
    filterSize,
    getS3Objects,
    isKey,
    isImg,
    isJson,
    isVid,
    isYml,
  }

  return o
}

async function getS3Data() {
  try {
    const xmlApi = createS3XmlReader()
    const store = { images: {}, ymls: {}, json: {}, videos: {} }
    const s3Objects = await xmlApi.getS3Objects()
    const chunks = chunk(s3Objects, 5)
    u.forEach(
      (c) =>
        u.forEach((obj) => {
          const item = {
            url: xmlApi.createUrl(obj.Key),
            modifiedAt: obj.LastModified,
            size: prettyBytes(obj.Size),
          }
          const url = item.url
          if (xmlApi.isImg(obj.Key)) store.images[url] = item
          else if (xmlApi.isVid(obj.Key)) store.videos[url] = item
          else if (xmlApi.isYml(obj.Key)) store.ymls[url] = item
          else if (xmlApi.isJson(obj.Key)) store.json[url] = item
        }, c),
      chunks,
    )
    console.log('DONE')
    return store
  } catch (error) {
    console.error(error)
  }
}

// getS3Data()
//   .then(async (store) => {
//     console.log(u.keys(store.ymls))

// fs.writeJson(
//   getAbsFilePath('./data/results.json'),
//   { timestamp: new Date().toISOString(), ...store },
//   { spaces: 2 },
// )
// })
// .catch(console.error)

function fetchAssetMetadata(url = '') {
  try {
    const resp = await axios.get(url)
    const parsedUrl = path.parse(url)
    return {
      filename: parsedUrl.base,
      name: parsedUrl.name,
      ext: parsedUrl.ext,
      lastModified: new Date(resp.headers['last-modified']).getTime(),
      mimeType: resp.headers['content-type'],
      server: resp.headers.server,
      size: Number(resp.headers['content-length']),
      url: resp.config.url,
    }
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
}

fetchAssetMetadata(
  'https://public.aitmed.com/android/deploymentProcess/android_09.png',
)
  .then((metadata) => {
    process.stdout.write('\x1Bc')
    console.dir({ metadata }, { depth: Infinity })
  })
  .catch(console.error)
