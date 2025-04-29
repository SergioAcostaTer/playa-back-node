import { Router } from 'express'
import { beaches } from './beaches'
import { auth } from './auth'
import { users } from './users'
import { reviews } from './reviews'
import { favourites } from './favourites'

const router: Router = Router()

const routes: {
  [key: string]: (router: Router) => void
} = { beaches, auth, users, reviews, favourites }

for (const route in routes) {
  routes[route](router)
}

export { router }
