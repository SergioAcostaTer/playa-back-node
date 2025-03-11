import express, { Express, Request, Response, NextFunction } from 'express'
import { join } from 'path'
import 'dotenv/config'

import '@/infrastructure/logger'
import { db } from '@/dataSources'
import {
  corsMiddleware,
  authMiddleware,
  notFoundMiddleware
} from '@/middlewares'
import { router } from '@/routes'
import winston from 'winston'

db.execute('SELECT 1 + 1 AS result').then(() => {
  winston.info('Postgres connected')
})

const app: Express = express()

// Static file serving for storage path (if configured in .env)
app.use(
  join('/', process.env.STORAGE_PATH || ''), // Fallback to empty string in case STORAGE_PATH is not set
  express.static(join(__dirname, process.env.STORAGE_PATH || '')) // Fallback if STORAGE_PATH is not set
)

app.use(
  express.json({ limit: '10mb' }),
  express.urlencoded({ limit: '10mb', extended: true }),
  corsMiddleware,
  authMiddleware,
  router,
  notFoundMiddleware
)

// Profile route - Uncomment if you need a profile page
// app.get('/profile', (req: Request, res: Response) => {
//   if (!req.isAuthenticated()) {
//     return res.redirect('/')
//   }
//   res.json(req.user) // Display user's Google profile info
// })

// Logout route - Uncomment if you need a logout route
// app.get('/logout', (req: Request, res: Response) => {
//   req.logout(err => {
//     res.redirect('/')
//   })
// })

// Start server
app.listen(process.env.APP_PORT, () => {
  winston.info(`Server is running on port ${process.env.APP_PORT}`)
})
