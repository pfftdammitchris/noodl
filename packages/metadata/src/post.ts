import * as u from '@jsmanifest/utils'
import axios from 'axios'
import { Handler } from '@netlify/functions'
import { APIGatewayEvent } from 'aws-lambda'
import path from 'path'
import _ from 'lodash'
import fs from 'fs-extra'
import yaml from 'yaml'

export const handler: Handler = (event, context, callback) => {
  return new Promise(async (resolve, reject) => {
    try {
    } catch (error) {
      console.error(error)
    }
  })
}
