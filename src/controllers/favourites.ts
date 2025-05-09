import { apiConfig } from '@/config/config'
import { db } from '@/dataSources'
import { beaches_grades } from '@/models/beaches_grades'
import { favourites } from '@/models/favourites'
import { and, count, eq } from 'drizzle-orm'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

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
        .where(
          and(eq(favourites.userId, user.id), eq(favourites.beachId, beachId))
        )

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
        message:
          'An unexpected error occurred while adding the beach to favorites'
      })
    }
  },
  removeFavourite: async (req: Request, res: Response) => {
    try {
      const { user } = req.context
      const beachId = Number(req.params.beachId)
      console.log('User context:', user)
      console.log('Request params:', req.params)

      if (!beachId || isNaN(beachId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: 'Beach ID is required and must be a valid number'
        })
      }

      // Verificar si existe en favoritos
      const existingFavorite = await db
        .select({ count: count() })
        .from(favourites)
        .where(
          and(eq(favourites.userId, user.id), eq(favourites.beachId, beachId))
        )

      if (existingFavorite[0]?.count === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          message: 'This beach is not in your favorites'
        })
      }

      // Eliminar la playa de favoritos
      await db
        .delete(favourites)
        .where(
          and(eq(favourites.userId, user.id), eq(favourites.beachId, beachId))
        )

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'Beach removed from favorites successfully'
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message:
          'An unexpected error occurred while removing the beach from favorites'
      })
    }
  },
  getFavourites: async (req: Request, res: Response) => {
    try {
      const { user } = req.context
      const page = Math.max(Number(req.query.page) || 1, 1)
      const limit = Math.min(
        Number(req.query.limit) || apiConfig.pagination.defaultLimit,
        apiConfig.pagination.maxLimit
      )

      const favouriteBeaches = await db
        .select()
        .from(favourites)
        .innerJoin(beaches_grades, eq(favourites.beachId, beaches_grades.id))
        .where(eq(favourites.userId, user.id))
        .limit(limit)
        .offset((page - 1) * limit)
        .execute()

      if (favouriteBeaches.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          message: 'No favorite beaches found'
        })
      }

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        data: favouriteBeaches
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred while fetching favorite beaches'
      })
    }
  },
  getFavouriteById: async (req: Request, res: Response) => {
    try {
      const { user } = req.context
      const beachId = Number(req.params.beachId)

      if (!beachId || isNaN(beachId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: 'Beach ID is required and must be a valid number'
        })
      }

      console.log('User context:', user)
      console.log('Request params:', req.params)

      const favouriteBeach = await db
        .select()
        .from(favourites)
        .where(
          and(eq(favourites.userId, user.id), eq(favourites.beachId, beachId))
        )
        .limit(1)
        .execute()

      if (favouriteBeach.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          message: 'This beach is not in your favorites'
        })
      }

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        data: favouriteBeach[0]
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message:
          'An unexpected error occurred while fetching the favorite beach'
      })
    }
  }
}
