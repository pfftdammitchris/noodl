import * as u from '@jsmanifest/utils'
import { Handler } from '@netlify/functions'
import { APIGatewayEvent } from 'aws-lambda'
import path from 'path'
import _ from 'lodash'
import fetch from 'node-fetch'
import fs from 'fs-extra'
import yaml from 'yaml'
import fromMarkdown from 'mdast-util-from-markdown'
import toMarkdown from 'mdast-util-to-markdown'
import {
  fromMarkdown as frontmatterFromMarkdown,
  toMarkdown as frontmatterToMarkdown,
} from 'mdast-util-frontmatter'
import visit from 'unist-util-visit'
import { frontmatter as syntaxFrontmatter } from 'micromark-extension-frontmatter'
import { getS3, getSuccessResponse, getErrorResponse } from './utils'
import { PostFunction } from './types'

const gistToken = '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'
const gistBaseUrl = 'https://api.github.com'
const headers = {
  Authorization: `token ${gistToken}`,
  Accept: 'application/vnd.github.v3+json',
}

// src/pages/posts/5-javascript-practices-that-will-help-others-sleep-at-night.md
const filename =
  '5-javascript-practices-that-will-help-others-sleep-at-night.md'
const filepath = `src/pages/posts/${filename}`
const markdown = fs.readFileSync(path.resolve(filepath), 'utf8')

export const handler: Handler = (event, context, callback) => {
  return new Promise(async (resolve, reject) => {
    try {
    } catch (error) {
      console.error(error)
    }
  })
}
