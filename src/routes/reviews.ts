import { Router } from 'express'
import { authGuard } from '@/guards'
import { reviewsController } from '@/controllers/reviewsController'

export const reviews = (router: Router): void => {
  router.get('/reviews/:beachId', reviewsController.getReviewsByBeach)
  router.post('/reviews', authGuard.isAuth, reviewsController.createReview)
  router.put('/reviews/:reviewId', authGuard.isAuth, reviewsController.updateReview)
  router.delete('/reviews/:reviewId', authGuard.isAuth, reviewsController.deleteReview)
}
