import { Router } from 'express'
import { beaches } from './beaches'
import { auth } from './auth'
import { users } from './users'
import { reviews } from './reviews'

const router: Router = Router()

const routes: {
  [key: string]: (router: Router) => void
} = { beaches, auth, users, reviews }

for (const route in routes) {
  routes[route](router)
}

export { router }
