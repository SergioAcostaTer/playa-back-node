import { Router } from 'express'
import { authController } from '@/controllers/authController'
import { authGuard } from '@/guards'

export const auth = (router: Router): void => {
  router.get('/auth/google', authGuard.isGuest, authController.google)
  router.get('/auth/google/callback', authController.googleCallback)
  router.post('/auth/log-out', authGuard.isAuth, authController.logOut)
}
