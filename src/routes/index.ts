import { Router } from 'express'
import { beaches } from './beaches'

const router: Router = Router()

const routes: {
  [key: string]: (router: Router) => void
} = { beaches }

for (const route in routes) {
  routes[route](router)
}

export { router }
