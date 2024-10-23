import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { create } from '../../businessLogic/todo.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'

const logger = createLogger('createTodo')

const lambda = async (event) => {
  logger.info('Processing create Todo', { event })

  try {
    const { body } = event
    const todo = JSON.parse(body)
    const userId = getUserId(event)
    const item = await create(todo, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({ item })
    }
  } catch (error) {
    logger.error('Todo creation failed', { error })

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to create Todo', error: error.message })
    }
  }
}

export const handler = middy(lambda)
  .use(httpErrorHandler())
  .use(cors({
    origin: '*',
    credentials: true
  }))
