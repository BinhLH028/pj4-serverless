import * as AWS from 'aws-sdk' // AWS SDK v2
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import AWSXRay from 'aws-xray-sdk-core'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { createLogger } from '../utils/logger.mjs'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

export class TodoAccess {
    constructor(
        docClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
        todosTable = process.env.TODOS_TABLE,
        todosUserIndex = process.env.TODOS_USER_INDEX,
        bucketName = process.env.ATTACHMENTS_S3_BUCKET,
        urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    ) {
        this.db = DynamoDBDocument.from(docClient)
        this.todosTable = todosTable
        this.index = todosUserIndex
        this.bucketName = bucketName
        this.expireTime = urlExpiration
      }
    async getAllTodos(userId) {
        console.log('Getting all todos')

        const result = await this.db.query({
            TableName: this.todosTable,
            IndexName: this.todosUserIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })

        const items = result.Items
        return items
    }

    async getTodoItem(todoId, userId) {
        const result = await this.db.query({
            TableName: this.todosTable,
            IndexName: this.todosUserIndex,
            KeyConditionExpression: 'userId = :userId and todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        })

        const item = result.Items[0]
        return item
    }

    async create(todo) {

        console.log('Creating new todo: ' +  todo )
        logger.info('Creating new todo: ' ,  todo )
        await this.db.put({
            TableName: this.todosTable,
            Item: todo
        })

        return todo
    }

    async update(userId, todoId, update) {
        const todo = {
            TableName: this.todosTable,
            Key:
            {
                todoId,
                userId,
            },
            UpdateExpression: 'set #n = :name, done = :done, dueDate = :dueDate',
            ExpressionAttributeValues:
            {
                ':name': update.name,
                ':done': update.done,
                ':dueDate': update.dueDate,
            },
            ExpressionAttributeNames:
            {
                '#n': 'name'
            },
        }

        this.db.update(todo)
    }

    async delete(userId, todoId) {
        const todo = {
            TableName: this.todosTable,
            Key: { userId, todoId }
        }

        await this.db.delete(todo)
    }

    async updateAttachedFileUrl(userId, todoId) {
        // const uploadUrl = this.s3.getSignedUrl("putObject", {
        //     Bucket: this.bucketName,
        //     Key: todoId,
        //     Expires: Number(expireTime),
        // });
        const url = await getSignedUrl(
            new S3Client(),
            new PutObjectCommand({
              Bucket: this.bucketName,
              Key: todoId
            }),
            {
              expiresIn: this.expireTime
            }
          )

        const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
        const todo = {
            TableName: this.todosTable,
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            Key: {
                userId,
                todoId
            },
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl,
            },
        }

        await this.db.update(todo)
        return url
    }
}

// function createDynamoDBClient() {
//     if (process.env.IS_OFFLINE) {
//         console.log("Creating a local DynamoDB instance")
//         return new XAWS.DynamoDB.DocumentClient({
//             region: "localhost",
//             endpoint: "http://localhost:8000",
//         })
//     }

//     return new XAWS.DynamoDB.DocumentClient()
// }
