import dotenv from 'dotenv'
dotenv.config()
import * as u from '@jsmanifest/utils'
import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'

const tag = `[${chalk.keyword('navajowhite')('gitlab')}]`

function throwError(err) {
  if (err instanceof Error) throw err
  throw new Error(err)
}

class Gitlab {
  #req = axios.create({
    baseURL: `https://gitlab.aitmed.com/api/v4`,
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_TOKEN}`,
    },
  })
  #token = ''

  constructor(token) {
    this.#token = token
  }

  async getProjects() {
    try {
      const resp = await this.#req.get(`/projects`)
      return resp.data
    } catch (error) {
      throwError(error)
    }
  }
}

const gitlab = new Gitlab(process.env.GITLAB_TOKEN)

const start = async () => {
  try {
    const result = await gitlab.getProjects()
    result.forEach((r) => console.log(r.name))
    // console.log(`Projects`, result)
  } catch (error) {
    console.error(error)
  }
}

const activeProjects = [{ label: 'search', id: 213 }]

start()

export default Gitlab
