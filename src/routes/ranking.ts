import { rankingController } from '@/controllers/rankingController'
import { Router } from 'express'

const ranking = (router: Router): void => {
  router.get('/ranking', rankingController.getRanking)
  router.get('/ranking/:island', rankingController.getRankingByIsland)
}

export { ranking }
