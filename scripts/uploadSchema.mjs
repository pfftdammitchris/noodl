import dotenv from 'dotenv'
dotenv.config()
import * as u from '@jsmanifest/utils'
import fs from 'fs-extra'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const Bucket = 'noodl'
const filename = `noodl.schema.json`
const filepath = path.resolve(
  path.join(process.cwd(), `configuration/${filename}`),
)
const schemaUrl = `https://noodl.s3.us-west-1.amazonaws.com/noodl.schema.json`

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  region: 'us-west-1',
})

async function upload(body) {
  try {
    u.newline()
    console.log(`${u.cyan(`Uploading...`)}`)
    await s3.send(
      new PutObjectCommand({
        ACL: 'public-read',
        Body: body,
        Bucket,
        Key: filename,
        ContentDisposition: 'inline',
        ContentType: 'application/json',
      }),
    )
    console.log(`${u.green(`Uploaded!`)}`)
    u.newline()
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
}

upload(fs.readFileSync(filepath, { encoding: 'utf8' }))
