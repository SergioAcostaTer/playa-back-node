import { Router } from 'express'
import { auth } from './auth'
import { beaches } from './beaches'
import { favourites } from './favourites'
import { ranking } from './ranking'
import { reviews } from './reviews'
import { users } from './users'

const router: Router = Router()

const routes: {
  [key: string]: (router: Router) => void
} = { beaches, auth, users, reviews, favourites, ranking }

for (const route in routes) {
  routes[route](router)
}

export { router }
