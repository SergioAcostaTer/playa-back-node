import express, { Express } from 'express'
import { join } from 'path'
import 'dotenv/config'

import '@/infrastructure/logger'
import { postgres } from '@/dataSources'
import {
  corsMiddleware,
  authMiddleware,
  notFoundMiddleware
} from '@/middlewares'
import { router } from '@/routes'
import winston from 'winston'
import { users } from './models/users'

postgres.execute('SELECT 1 + 1 AS result').then(() => {
  winston.info('Postgres connected')
})

const app: Express = express()

app.use(
  join('/', process.env.STORAGE_PATH),
  express.static(join(__dirname, process.env.STORAGE_PATH))
)

app.get('/', async (req, res) => {
  const user = await postgres.insert(users).values({
    name: 'Sergio',
    username: 'sergio123',
    email: 'sergio@example.com',
    googleHash: null // Assuming no Google login
  })

  return res.json(user)
})

app.use(
  '/v1',
  express.json({ limit: '10mb' }),
  express.urlencoded({ limit: '10mb', extended: true }),
  corsMiddleware,
  router,
  notFoundMiddleware
)

app.listen(process.env.APP_PORT, () => {
  winston.info(`Server is running on port ${process.env.APP_PORT}`)
})
