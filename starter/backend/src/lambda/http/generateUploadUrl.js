import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { updateAttachedFileUrl } from '../../businessLogic/todo.mjs'
import { getUserId } from '../utils.mjs'

const lambda = async (event) => {
  try {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const url = await updateAttachedFileUrl(userId, todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({ url })
    }
  } catch (e) {
    logger.error('error: ', e)
    return {
      statusCode: 500,
      body: JSON.stringify({ e })
    }
  }
}

export const handler = middy(lambda)
  .use(httpErrorHandler())
  .use(
    cors({
      origin: '*',
      credentials: true
    })
  )