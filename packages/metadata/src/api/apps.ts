import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'

export default async function appsFunction(
  req: GatsbyFunctionRequest,
  resp: GatsbyFunctionResponse,
) {
  try {
    const { body, method, params, query } = req
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return resp.json({
      statusCode: 500,
      error: { name: err.name, message: err.message },
    })
  }
}
