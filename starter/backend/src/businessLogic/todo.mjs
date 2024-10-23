import * as uuid from 'uuid'
import { TodoAccess } from "../dataLayer/todoAccess.mjs"

const todoAccess = new TodoAccess()

export async function getAllTodosForUser(userId) {
  return todoAccess.getAllTodos(userId)
}

export async function create(
  createTodoRequest,
  userId
) {
  const todoId = uuid.v4()
  return todoAccess.create({
    todoId: todoId,
    userId: userId,
    createdAt: new Date().toISOString(),
    done: false,
    ...createTodoRequest
  })
}

export async function update(
  userId,
  todoId,
  updatedTodo
) {
  todoAccess.update(userId, todoId, updatedTodo)
}

export async function deleteTodo(
  todoId,
  userId
) {
  todoAccess.delete(todoId, userId)
}

export async function updateAttachedFileUrl(
  userId,
  todoId
) {
  return todoAccess.updateAttachedFileUrl(userId, todoId)
}
