import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { deleteTodo } from '../../businessLogic/todo.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'

const logger = createLogger('deleteTodo')

const lambda = async (event) => {
  logger.info('Processing delete request', { event })

  try {
    const { todoId } = event.pathParameters
    const userId = getUserId(event)

    await deleteTodo(userId, todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Todo deleted successfully' })
    }
  } catch (error) {
    logger.error('Failed to delete Todo', { error })

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to delete Todo', error: error.message })
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
