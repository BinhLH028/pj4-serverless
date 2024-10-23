import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getAllTodosForUser } from '../../businessLogic/todo.mjs'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('getTodos')

const lambda = async (event) => {
  logger.info('Processing get todos: ', event)
  try {
    const userId = getUserId(event)
    const tasks = await getAllTodosForUser(userId)

    return {
      statusCode: 200,
      body: JSON.stringify(tasks)
    }
  } catch (error) {
    logger.error('Get todos failed: ', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error })
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