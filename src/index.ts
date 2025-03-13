import express, { Express } from 'express'
import { resolve } from 'path'
import 'dotenv/config'
import winston from 'winston'

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

app.get('/', (req, res) => {
  res.send(`
    <h1>Playea API</h1>
    <p>Visit our page in <a href="playea.eu">Playea</a></p>
    `)
})

app.use(notFoundMiddleware)

// Start server
app.listen(process.env.APP_PORT, () => {
  winston.info(`Server is running on port ${process.env.APP_PORT}`)
})
