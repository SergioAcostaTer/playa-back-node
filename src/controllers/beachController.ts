import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/dataSources'
import { beaches } from '@/models/beaches'
import { sql } from 'drizzle-orm'

export const beachController = {
  getAllBeaches: async (req: Request, res: Response) => {
    try {
      const beachesFromDb = await db.select().from(beaches)

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        data: beachesFromDb
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
        .where(sql`${beaches.id} = ${beachId}`)
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
      const { q, page = 1, limit = 10 } = req.query
      const offset = (Number(page) - 1) * Number(limit)
      const beachesFromDb = await db
        .select()
        .from(beaches)
        .where(sql`${beaches.name} ILIKE ${`%${q}%`}`)
        .orderBy(beaches.name)
        .limit(Number(limit))
        .offset(offset)

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        data: beachesFromDb
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred during fetching beaches'
      })
    }
  }
}
