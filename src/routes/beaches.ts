import { beachController } from '@/controllers/beachController'
import { Router } from 'express'

const beaches = (router: Router): void => {
  router.get('/beaches', beachController.getAllBeaches)
  router.get('/beaches/search', beachController.search)
  router.get('/beaches/searchSuggestions', beachController.searchSuggest)
  router.get('/beaches/:slug', beachController.getBeachBySlug)
}

export { beaches }
