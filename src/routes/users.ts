import { Router } from 'express'

import { authGuard } from '@/guards'
import { userController } from '@/controllers'

export const users = (router: Router): void => {
  router.get('/me', authGuard.isAuth, userController.me)
  router.delete('/me', authGuard.isAuth, userController.deleteMe)
}
