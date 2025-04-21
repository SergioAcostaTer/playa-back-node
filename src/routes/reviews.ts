import { Router } from 'express'
import { authGuard } from '@/guards'
import { reviewsController } from '@/controllers/reviewsController'

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Reviews management endpoints
 */

/**
 * @swagger
 * /reviews/{beachId}:
 *   get:
 *     summary: Get reviews for a beach
 *     description: Retrieve all reviews for a specific beach identified by beachId.
 *     tags: [Reviews]
 *     parameters:
 *       - name: beachId
 *         in: path
 *         required: true
 *         description: The unique ID of the beach for which to fetch reviews
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully fetched reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       userId:
 *                         type: integer
 *                       beachId:
 *                         type: integer
 *       400:
 *         description: Missing beachId parameter
 *       404:
 *         description: No reviews found for the given beach
 *       500:
 *         description: Internal server error
 */
export const reviews = (router: Router): void => {
  router.get('/reviews/:beachId', reviewsController.getReviewsByBeach)

  /**
   * @swagger
   * /reviews:
   *   post:
   *     summary: Create a new review
   *     description: Allows an authenticated user to create a new review for a beach.
   *     tags: [Reviews]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               beachId:
   *                 type: integer
   *               rating:
   *                 type: integer
   *               comment:
   *                 type: string
   *             required:
   *               - beachId
   *               - rating
   *     responses:
   *       201:
   *         description: Successfully created the review
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: integer
   *                   description: HTTP status code
   *                 message:
   *                   type: string
   *                   description: Success message
   *                 review:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     rating:
   *                       type: integer
   *                     comment:
   *                       type: string
   *                     userId:
   *                       type: integer
   *                     beachId:
   *                       type: integer
   *       400:
   *         description: Missing required fields (beachId or rating)
   *       401:
   *         description: Unauthorized if the user is not authenticated
   *       500:
   *         description: Internal server error
   */
  router.post('/reviews', authGuard.isAuth, reviewsController.createReview)

  /**
   * @swagger
   * /reviews/{reviewId}:
   *   put:
   *     summary: Update an existing review
   *     description: Allows an authenticated user to update their own review.
   *     tags: [Reviews]
   *     parameters:
   *       - name: reviewId
   *         in: path
   *         required: true
   *         description: The unique ID of the review to be updated
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               rating:
   *                 type: integer
   *               comment:
   *                 type: string
   *             required:
   *               - rating
   *     responses:
   *       200:
   *         description: Successfully updated the review
   *       400:
   *         description: Missing required fields (rating)
   *       404:
   *         description: Review not found
   *       403:
   *         description: Forbidden if the user is not the owner of the review
   *       500:
   *         description: Internal server error
   */
  router.put('/reviews/:reviewId', authGuard.isAuth, reviewsController.updateReview)

  /**
   * @swagger
   * /reviews/{reviewId}:
   *   delete:
   *     summary: Delete an existing review
   *     description: Allows an authenticated user to delete their own review.
   *     tags: [Reviews]
   *     parameters:
   *       - name: reviewId
   *         in: path
   *         required: true
   *         description: The unique ID of the review to be deleted
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Successfully deleted the review
   *       404:
   *         description: Review not found
   *       403:
   *         description: Forbidden if the user is not the owner of the review
   *       500:
   *         description: Internal server error
   */
  router.delete('/reviews/:reviewId', authGuard.isAuth, reviewsController.deleteReview)
}
