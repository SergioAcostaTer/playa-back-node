import { apiConfig } from '@/config/config'
import { db } from '@/dataSources'
import { beaches_grades } from '@/models/beaches_grades'
import { and, count, eq, ilike, SQL } from 'drizzle-orm'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { URL } from 'url'

const buildFilterConditions = (query: Record<string, any>) => {
  const filters: SQL[] = []

  const filterMap = {
    name: query.name
      ? ilike(beaches_grades.name, `%${query.name}%`)
      : undefined,
    island: query.island
      ? ilike(beaches_grades.island, `%${query.island}%`)
      : undefined,
    province: query.province
      ? ilike(beaches_grades.province, `%${query.province}%`)
      : undefined,
    hasMixedComposition:
      query.hasMixedComposition !== undefined &&
      query.hasMixedComposition !== ''
        ? eq(
            beaches_grades.hasMixedComposition,
            query.hasMixedComposition === 'true'
          )
        : undefined,
    sportsArea:
      query.sportsArea !== undefined && query.sportsArea !== ''
        ? eq(beaches_grades.sportsArea, query.sportsArea === 'true')
        : undefined,
    wheelchairAccess:
      query.wheelchairAccess !== undefined && query.wheelchairAccess !== ''
        ? eq(beaches_grades.wheelchairAccess, query.wheelchairAccess === 'true')
        : undefined,
    hasAdaptedShowers:
      query.hasAdaptedShowers !== undefined && query.hasAdaptedShowers !== ''
        ? eq(
            beaches_grades.hasAdaptedShowers,
            query.hasAdaptedShowers === 'true'
          )
        : undefined
  }

  return Object.values(filterMap).filter(
    (condition): condition is SQL => condition !== undefined
  )
}

const getPagination = (page: number, limit: number, totalCount: number) => {
  const totalPages = Math.ceil(totalCount / limit)
  const offset = (page - 1) * limit

  return { offset, totalPages, totalCount }
}

export const beachController = {
  getAllBeaches: async (req: Request, res: Response) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1)
      const limit = Math.min(
        Number(req.query.limit) || apiConfig.pagination.defaultLimit,
        apiConfig.pagination.maxLimit
      )

      const filterConditions = buildFilterConditions(req.query)

      const baseQuery = db.select().from(beaches_grades)
      const countQuery = db.select({ count: count() }).from(beaches_grades)

      if (filterConditions.length) {
        baseQuery.where(and(...filterConditions))
        countQuery.where(and(...filterConditions))
      }

      const totalCountResult = await countQuery
      const totalCount = totalCountResult[0]?.count || 0

      const { offset, totalPages } = getPagination(page, limit, totalCount)

      const beachesFromDb = await baseQuery.limit(limit).offset(offset)

      const queryParams = new URLSearchParams(
        req.query as Record<string, string>
      )
      queryParams.set('page', String(page + 1))
      queryParams.set('limit', String(limit))

      const nextPage =
        page < totalPages
          ? new URL(
              `/beaches_grades?${queryParams.toString()}`,
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
      console.error('Error fetching beaches_grades:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred during fetching beaches_grades'
      })
    }
  },

  // getBeachById: async (req: Request, res: Response) => {
  //   try {
  //     const beachId = Number(req.params.id)
  //     const beachFromDb = await db
  //       .select()
  //       .from(beaches_grades)
  //       .where(eq(beaches_grades.id, beachId))
  //       .limit(1)

  //     if (!beachFromDb.length) {
  //       return res.status(StatusCodes.NOT_FOUND).json({
  //         status: StatusCodes.NOT_FOUND,
  //         message: 'Beach not found'
  //       })
  //     }

  //     return res.status(StatusCodes.OK).json({
  //       status: StatusCodes.OK,
  //       data: beachFromDb[0]
  //     })
  //   } catch (error) {
  //     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
  //       status: StatusCodes.INTERNAL_SERVER_ERROR,
  //       message: 'An unexpected error occurred during fetching beach'
  //     })
  //   }
  // },

  getBeachBySlug: async (req: Request, res: Response) => {
    try {
      const slug = String(req.params.slug)
      const beachFromDb = await db
        .select()
        .from(beaches_grades)
        .where(ilike(beaches_grades.slug, slug))
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

      // Condición básica de búsqueda por nombre con búsqueda flexible
      const conditions: SQL[] = []

      if (q) {
        // Solo agregar esta condición si la query no está vacía
        conditions.push(ilike(beaches_grades.name, `%${q}%`))
      }

      // Agregar filtros adicionales con condiciones flexibles
      const filterConditions = buildFilterConditions(req.query)
      conditions.push(...filterConditions)

      // Calcular total de resultados
      const totalCountResult = await db
        .select({ count: count() })
        .from(beaches_grades)
        .where(and(...conditions))

      const totalCount = totalCountResult[0]?.count || 0

      // Obtener la paginación
      const { offset, totalPages } = getPagination(page, limit, totalCount)

      const beachesFromDb = await db
        .select()
        .from(beaches_grades)
        .where(and(...conditions))
        .orderBy(beaches_grades.name)
        .limit(limit)
        .offset(offset)

      const queryParams = new URLSearchParams(
        req.query as Record<string, string>
      )
      queryParams.set('page', String(Number(page) + 1))
      queryParams.set('limit', String(limit))

      const nextPage =
        page < totalPages
          ? new URL(
              `/beaches_grades/search?${queryParams.toString()}`,
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
        message: 'An unexpected error occurred during fetching beaches_grades'
      })
    }
  },
  searchSuggest: async (req: Request, res: Response) => {
    try {
      const q = String(req.query.q || '').trim()
      const limit = 5

      // Condición básica de búsqueda por nombre con búsqueda flexible
      const conditions: SQL[] = []

      if (q) {
        // Solo agregar esta condición si la query no está vacía
        conditions.push(ilike(beaches_grades.name, `%${q}%`))
      }

      const beachesFromDb = await db
        .select({
          name: beaches_grades.name,
          slug: beaches_grades.slug,
          image: beaches_grades.coverUrl,
          island: beaches_grades.island
        })
        .from(beaches_grades)
        .where(and(...conditions))
        .orderBy(beaches_grades.name)
        .limit(limit)

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        data: beachesFromDb
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred during fetching beaches_grades'
      })
    }
  }
}
