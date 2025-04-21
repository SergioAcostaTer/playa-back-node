import { Router } from 'express'
import { authController } from '@/controllers/authController'
import { authGuard } from '@/guards'

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related endpoints
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiates the Google OAuth2 login process
 *     description: Redirects the user to Google's OAuth2 authentication page.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth2 login page
 */
export const auth = (router: Router): void => {
  router.get('/auth/google', authGuard.isGuest, authController.google)

  /**
   * @swagger
   * /auth/google/callback:
   *   get:
   *     summary: Handles Google OAuth2 callback and exchanges code for tokens
   *     description: After the user authenticates via Google, this endpoint receives the callback and exchanges the authorization code for an access token.
   *     tags: [Auth]
   *     parameters:
   *       - name: code
   *         in: query
   *         description: The OAuth2 authorization code returned by Google
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       302:
   *         description: Redirects to the client URL after successful authentication
   *       400:
   *         description: Missing or invalid code parameter
   *       500:
   *         description: Internal server error, failed to exchange code or retrieve user info
   */
  router.get('/auth/google/callback', authController.googleCallback)

  /**
   * @swagger
   * /auth/log-out:
   *   post:
   *     summary: Logs the user out and clears the authentication token
   *     description: Clears the user's authentication token from cookies and ends the session.
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Successfully logged out
   *       500:
   *         description: Internal server error during the logout process
   */
  router.post('/auth/log-out', authGuard.isAuth, authController.logOut)
}
