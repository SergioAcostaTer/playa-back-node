import { Router } from 'express'
import { authGuard } from '@/guards'
import { userController } from '@/controllers'

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get the current authenticated user's profile
 *     description: Returns the profile of the currently authenticated user.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully fetched user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: The user profile object
 *                 message:
 *                   type: string
 *                   description: Status message
 *                 status:
 *                   type: integer
 *                   description: HTTP status code
 *       401:
 *         description: Unauthorized if the user is not authenticated
 */
export const users = (router: Router): void => {
  router.get('/me', authGuard.isAuth, userController.me)

  /**
   * @swagger
   * /me:
   *   delete:
   *     summary: Delete the current authenticated user's account
   *     description: Deletes the account of the currently authenticated user.
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: Successfully deleted the user's account and redirected
   *       401:
   *         description: Unauthorized if the user is not authenticated
   *       500:
   *         description: Internal server error if the account deletion fails
   */
  router.delete('/me', authGuard.isAuth, userController.deleteMe)
}
