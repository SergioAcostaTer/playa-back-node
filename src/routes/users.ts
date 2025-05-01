import { userController } from '@/controllers'
import { authGuard } from '@/guards'
import { Router } from 'express'

export const users = (router: Router): void => {
  router.get('/me', authGuard.isAuth, userController.me)
  router.delete('/me', authGuard.isAuth, userController.deleteMe)
  router.put('/me', authGuard.isAuth, userController.updateMe)
}
