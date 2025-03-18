import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/dataSources'
import { beaches } from '@/models/beaches'
import { eq, ilike, and, count, SQL } from 'drizzle-orm'
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

      const filterConditions: SQL[] = []

      if (req.query.island) {
        filterConditions.push(eq(beaches.island, String(req.query.island)))
      }
      if (req.query.province) {
        filterConditions.push(eq(beaches.province, String(req.query.province)))
      }
      if (req.query.hasMixedComposition) {
        filterConditions.push(eq(beaches.hasMixedComposition, req.query.hasMixedComposition === 'true'))
      }
      if (req.query.sportsArea) {
        filterConditions.push(eq(beaches.sportsArea, req.query.sportsArea === 'true'))
      }
      if (req.query.wheelchairAccess) {
        filterConditions.push(eq(beaches.wheelchairAccess, req.query.wheelchairAccess === 'true'))
      }

      const baseQuery = db.select().from(beaches)
      const countQuery = db.select({ count: count() }).from(beaches)

      if (filterConditions.length) {
        baseQuery.where(and(...filterConditions))
        countQuery.where(and(...filterConditions))
      }

      const totalCountResult = await countQuery
      const totalCount = totalCountResult[0]?.count || 0
      const totalPages = Math.ceil(totalCount / limit)

      const beachesFromDb = await baseQuery.limit(limit).offset(offset)

      const queryParams = new URLSearchParams(req.query as Record<string, string>)
      queryParams.set('page', String(Number(page) + 1))
      queryParams.set('limit', String(limit))

      const nextPage =
        page < totalPages
          ? new URL(`/beaches?${queryParams.toString()}`, `${req.protocol}://${req.get('host')}`).toString()
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

      const conditions: SQL[] = [ilike(beaches.name, `%${q}%`)]

      if (req.query.island) {
        conditions.push(eq(beaches.island, String(req.query.island)))
      }
      if (req.query.province) {
        conditions.push(eq(beaches.province, String(req.query.province)))
      }
      if (req.query.hasMixedComposition) {
        conditions.push(eq(beaches.hasMixedComposition, req.query.hasMixedComposition === 'true'))
      }
      if (req.query.sportsArea) {
        conditions.push(eq(beaches.sportsArea, req.query.sportsArea === 'true'))
      }
      if (req.query.wheelchairAccess) {
        conditions.push(eq(beaches.wheelchairAccess, req.query.wheelchairAccess === 'true'))
      }

      const totalCountResult = await db
        .select({ count: count() })
        .from(beaches)
        .where(and(...conditions))

      const totalCount = totalCountResult[0]?.count || 0
      const totalPages = Math.ceil(totalCount / limit)

      const beachesFromDb = await db
        .select()
        .from(beaches)
        .where(and(...conditions))
        .orderBy(beaches.name)
        .limit(limit)
        .offset(offset)

      const queryParams = new URLSearchParams(req.query as Record<string, string>)
      queryParams.set('page', String(Number(page) + 1))
      queryParams.set('limit', String(limit))

      const nextPage =
        page < totalPages
          ? new URL(`/beaches/search?${queryParams.toString()}`, `${req.protocol}://${req.get('host')}`).toString()
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