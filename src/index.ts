import express, { Express } from 'express'
import { resolve } from 'path'
import 'dotenv/config'
import winston from 'winston'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

import '@/infrastructure/logger'
import { db } from '@/dataSources'
import {
  corsMiddleware,
  authMiddleware,
  notFoundMiddleware
} from '@/middlewares'
import { router } from '@/routes'

// Connect to the database
db.execute('SELECT 1 + 1 AS result').then(() => {
  winston.info('Postgres connected')
})

const app: Express = express()

// Swagger JSDoc configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // OpenAPI version
    info: {
      title: 'Playea API',
      version: '1.0.0',
      description: 'API documentation for Playea service',
    },
    servers: [
      {
        url: process.env.APP_URL || 'http://localhost:3000', // Your API base URL
      },
    ],
  },
  apis: ['./routes/*.ts'], // Path to your route files for extracting JSDoc comments
}

// Generate Swagger documentation
const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Serve Swagger UI at the `/docs` route
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Ensure STORAGE_PATH is defined correctly
const storagePath = process.env.STORAGE_PATH || 'storage/public'
const absoluteStoragePath = resolve(__dirname, storagePath)

// Log storage path for debugging
winston.info(`Serving static files from: ${absoluteStoragePath}`)

// Serve static files from the configured directory
app.use(`/${storagePath}`, express.static(absoluteStoragePath))

// Ensure static files middleware is before dynamic routes
app.use(
  express.json({ limit: '10mb' }),
  express.urlencoded({ limit: '10mb', extended: true }),
  corsMiddleware,
  authMiddleware,
  router
)

app.use(notFoundMiddleware)

// Start server
app.listen(process.env.APP_PORT, () => {
  winston.info(`Server is running on port ${process.env.APP_PORT}`)
})
