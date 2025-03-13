import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/dataSources'
import { beaches } from '@/models/beaches'
import { eq, ilike, count } from 'drizzle-orm'
import { URL } from 'url'
import { apiConfig } from '@/config/config'

export const beachController = {
  getAllBeaches: async (req: Request, res: Response) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1)
      const limit = Math.min(
        Number(req.query.limit) || apiConfig.pagination.defaultLimit,
        apiConfig.pagination.maxLimit
      )
      const offset = (page - 1) * limit

      // Get total count of beaches
      const totalCountResult = await db.select({ count: count() }).from(beaches)
      const totalCount = totalCountResult[0]?.count || 0
      const totalPages = Math.ceil(totalCount / limit)

      // Get paginated beaches data
      const beachesFromDb = await db
        .select()
        .from(beaches)
        .limit(limit)
        .offset(offset)

      // Create the next page link
      const nextPage =
        page < totalPages
          ? new URL(
              `/beaches?page=${page + 1}&limit=${limit}`,
              `${req.protocol}://${req.get('host')}`
            ).toString()
          : null

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        data: beachesFromDb,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          nextPage,
          limit
        }
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred during fetching beaches'
      })
    }
  },

  getBeachById: async (req: Request, res: Response) => {
    try {
      const beachId = Number(req.params.id)
      const beachFromDb = await db
        .select()
        .from(beaches)
        .where(eq(beaches.id, beachId))
        .limit(1)

      if (!beachFromDb.length) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          message: 'Beach not found'
        })
      }

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        data: beachFromDb[0]
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred during fetching beach'
      })
    }
  },

  search: async (req: Request, res: Response) => {
    try {
      const q = String(req.query.q || '').trim()
      const page = Math.max(Number(req.query.page) || 1, 1)
      const limit = Math.min(
        Number(req.query.limit) || apiConfig.pagination.defaultLimit,
        apiConfig.pagination.maxLimit
      )
      const offset = (page - 1) * limit

      // Get total count of matching beaches
      const totalCountResult = await db
        .select({ count: count() })
        .from(beaches)
        .where(ilike(beaches.name, `%${q}%`))
      const totalCount = totalCountResult[0]?.count || 0
      const totalPages = Math.ceil(totalCount / limit)

      // Get the paginated beaches data
      const beachesFromDb = await db
        .select()
        .from(beaches)
        .where(ilike(beaches.name, `%${q}%`))
        .orderBy(beaches.name)
        .limit(limit)
        .offset(offset)

      // Create the next page link
      const nextPage =
        page < totalPages
          ? new URL(
              `/beaches/search?q=${q}&page=${page + 1}&limit=${limit}`,
              `${req.protocol}://${req.get('host')}`
            ).toString()
          : null

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        data: beachesFromDb,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          nextPage,
          limit
        }
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred during fetching beaches'
      })
    }
  }
}
