import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { update } from '../../businessLogic/todo.mjs'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('updateTodo')

const lambda = async (event) => {
  try {
    const todoId = event.pathParameters.todoId
    const updatedTodo = JSON.parse(event.body)
    const userId = getUserId(event)
    await update(userId, todoId, updatedTodo)
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Todo updated successfully' })
    }
  } catch (error) {
    logger.error('Update failed: ', error)
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