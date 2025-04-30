import { db } from '@/dataSources'
import { reviews, users } from '@/models'
import { desc, eq } from 'drizzle-orm'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import winston from 'winston'

export const reviewsController = {
  createReview: async (req: Request, res: Response) => {
    const { user } = req.context

    const { beachId, rating, comment } = req.body

    if (!beachId || rating === undefined || rating === null) {
      return res.status(StatusCodes.BAD_REQUEST).send('Missing required fields')
    }

    try {
      // Insert review into the database
      const newReview = await db
        .insert(reviews)
        .values({
          userId: user.id, // Use user from context
          beachId,
          rating,
          comment: comment || '' // Allow empty comment
        })
        .returning()
        .execute()

      return res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        message: 'Review created successfully',
        review: newReview[0] // Return the created review
      })
    } catch (error) {
      winston.error('Error creating review: ', error)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send('Error creating review')
    }
  },

  getReviewsByBeach: async (req: Request, res: Response) => {
    const { beachId } = req.params

    if (!beachId) {
      return res.status(StatusCodes.BAD_REQUEST).send('Beach ID is required')
    }

    try {
      const reviewsList = await db
        .select()
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.beachId, parseInt(beachId)))
        .orderBy(desc(reviews.createdAt))
        .execute()

      if (reviewsList.length === 0) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .send('No reviews found for this beach')
      }

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        reviews: reviewsList
      })
    } catch (error) {
      winston.error('Error fetching reviews: ', error)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send('Error fetching reviews')
    }
  },

  updateReview: async (req: Request, res: Response) => {
    const { user } = req.context
    const { reviewId } = req.params
    const { rating, comment } = req.body

    if (rating === undefined || rating === null) {
      return res.status(StatusCodes.BAD_REQUEST).send('Rating is required')
    }

    try {
      // Ensure that the user is the one who created the review or has permission to update it
      const review = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, parseInt(reviewId)))
        .execute()

      if (review.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).send('Review not found')
      }

      if (review[0].userId !== user.id) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .send('You can only update your own review')
      }

      // Update the review
      const updatedReview = await db
        .update(reviews)
        .set({
          rating,
          comment: comment || '' // If no comment, leave it empty
        })
        .where(eq(reviews.id, parseInt(reviewId)))
        .returning()
        .execute()

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'Review updated successfully',
        review: updatedReview[0]
      })
    } catch (error) {
      winston.error('Error updating review: ', error)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send('Error updating review')
    }
  },

  deleteReview: async (req: Request, res: Response) => {
    const { user } = req.context
    const { reviewId } = req.params

    try {
      const review = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, parseInt(reviewId)))
        .execute()

      if (review.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).send('Review not found')
      }

      if (review[0].userId !== user.id) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .send('You can only delete your own review')
      }

      await db
        .delete(reviews)
        .where(eq(reviews.id, parseInt(reviewId)))
        .execute()

      return res.status(StatusCodes.NO_CONTENT).json({
        status: StatusCodes.NO_CONTENT,
        message: 'Review deleted successfully'
      })
    } catch (error) {
      winston.error('Error deleting review: ', error)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send('Error deleting review')
    }
  }
}
