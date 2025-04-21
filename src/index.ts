import express, { Express } from 'express'
import { resolve } from 'path'
import 'dotenv/config'
import winston from 'winston'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import path from 'path'
import '@/infrastructure/logger'
import { db } from '@/dataSources'
import {
  corsMiddleware,
  authMiddleware,
  notFoundMiddleware
} from '@/middlewares'
import { router } from '@/routes'
import { consola } from 'consola-mini';

db.execute('SELECT 1 + 1 AS result').then(() => {
  consola.info('Postgres connected')
}).catch((err) => {
  consola.error('Database connection failed:', err)
})

const app: Express = express()

const swaggerFilePath = path.resolve(__dirname, 'swagger-docs.json')
const swaggerDocs = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf-8'))

// Serve Swagger UI at the `/api-docs` route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Ensure STORAGE_PATH is defined correctly
const storagePath = process.env.STORAGE_PATH || 'storage/public'
const absoluteStoragePath = resolve(__dirname, storagePath)

// Log storage path for debugging
consola.info(`Serving static files from: ${absoluteStoragePath}`)

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

app.get('/', (req, res) => {
  res.redirect('/api-docs')
})

app.use(notFoundMiddleware)

// Start server
app.listen(process.env.APP_PORT, () => {
  consola.info(`Server is running on port ${process.env.APP_PORT}`)
})
