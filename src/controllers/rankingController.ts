import { apiConfig } from '@/config/config'
import { db } from '@/dataSources'
import { beaches_grades } from '@/models/beaches_grades'
import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export const rankingController = {
  getRanking: async (req: Request, res: Response) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1)
      const limit = Math.min(
        Number(req.query.limit) || apiConfig.pagination.defaultLimit,
        apiConfig.pagination.maxLimit
      )

      const ranking = await db
        .select()
        .from(beaches_grades)
        .where(isNotNull(beaches_grades.grade))
        .orderBy(desc(beaches_grades.grade), desc(beaches_grades.reviewsCount))
        .limit(limit)
        .offset((page - 1) * limit)
        .execute()

      if (ranking.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          message: 'No beaches found in the ranking'
        })
      }

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        data: ranking
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred while fetching the ranking'
      })
    }
  },

  getRankingByIsland: async (req: Request, res: Response) => {
    try {
      const island = String(req.params.island)
      const page = Math.max(Number(req.query.page) || 1, 1)
      const limit = Math.min(
        Number(req.query.limit) || apiConfig.pagination.defaultLimit,
        apiConfig.pagination.maxLimit
      )

      const rankingByIsland = await db
        .select()
        .from(beaches_grades)
        .where(
          and(
            eq(beaches_grades.island, island),
            isNotNull(beaches_grades.grade)
          )
        )
        .orderBy(desc(beaches_grades.grade), desc(beaches_grades.reviewsCount))
        .limit(limit)
        .offset((page - 1) * limit)
        .execute()

      if (rankingByIsland.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          message: 'No beaches found in the ranking for this island'
        })
      }

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        data: rankingByIsland
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message:
          'An unexpected error occurred while fetching the ranking by island'
      })
    }
  }
}
