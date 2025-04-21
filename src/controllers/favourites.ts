import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/dataSources'
import { favourites } from '@/models/favourites'
import { eq, and, count } from 'drizzle-orm'

export const favouritesController = {
  addFavourite: async (req: Request, res: Response) => {
    try {
      const { user } = req.context
      const beachId = Number(req.params.beachId)

      if (!beachId || isNaN(beachId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: 'Beach ID is required and must be a valid number'
        })
      }

      // Verificar si ya existe en favoritos
      const existingFavorite = await db
        .select({ count: count() })
        .from(favourites)
        .where(and(eq(favourites.userId, user.id), eq(favourites.beachId, beachId)))

      if (existingFavorite[0]?.count > 0) {
        return res.status(StatusCodes.CONFLICT).json({
          status: StatusCodes.CONFLICT,
          message: 'This beach is already in your favorites'
        })
      }

      // Agregar la playa a favoritos
      await db.insert(favourites).values({
        userId: user.id,
        beachId: beachId
      })

      return res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        message: 'Beach added to favorites successfully'
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred while adding the beach to favorites'
      })
    }
  }
}
