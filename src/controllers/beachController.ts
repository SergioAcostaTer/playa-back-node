import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/dataSources'
import { beaches } from '@/models/beaches'
import { eq, ilike, and, count, SQL } from 'drizzle-orm'
import { URL } from 'url'
import { apiConfig } from '@/config/config'


const buildFilterConditions = (query: Record<string, any>) => {
  const filters: SQL[] = []

  // Definir el mapeo de los filtros
  const filterMap = {
    island: ilike(beaches.island, query.island),
    province: ilike(beaches.province, query.province),
    hasMixedComposition: eq(beaches.hasMixedComposition, query.hasMixedComposition === 'true'),
    sportsArea: eq(beaches.sportsArea, query.sportsArea === 'true'),
    wheelchairAccess: eq(beaches.wheelchairAccess, query.wheelchairAccess === 'true')
  }

  // Iterar sobre los filtros y agregar las condiciones
  for (const [key, condition] of Object.entries(filterMap)) {
    if (query[key]) filters.push(condition)
  }

  return filters
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

      // Obtener las condiciones de filtrado
      const filterConditions = buildFilterConditions(req.query)

      const baseQuery = db.select().from(beaches)
      const countQuery = db.select({ count: count() }).from(beaches)

      if (filterConditions.length) {
        baseQuery.where(and(...filterConditions))
        countQuery.where(and(...filterConditions))
      }

      const totalCountResult = await countQuery
      const totalCount = totalCountResult[0]?.count || 0

      // Obtener la paginación
      const { offset, totalPages } = getPagination(page, limit, totalCount)

      const beachesFromDb = await baseQuery.limit(limit).offset(offset)

      // Construir URL para la siguiente página
      const queryParams = new URLSearchParams(req.query as Record<string, string>)
      queryParams.set('page', String(page + 1))
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

  search: async (req: Request, res: Response) => {
    try {
      const q = String(req.query.q || '').trim()
      const page = Math.max(Number(req.query.page) || 1, 1)
      const limit = Math.min(
        Number(req.query.limit) || apiConfig.pagination.defaultLimit,
        apiConfig.pagination.maxLimit
      )

      // Condición básica de búsqueda por nombre
      const conditions: SQL[] = [ilike(beaches.name, `%${q}%`)]

      // Agregar filtros
      const filterConditions = buildFilterConditions(req.query)
      conditions.push(...filterConditions)

      // Calcular total de resultados
      const totalCountResult = await db
        .select({ count: count() })
        .from(beaches)
        .where(and(...conditions))

      const totalCount = totalCountResult[0]?.count || 0

      // Obtener la paginación
      const { offset, totalPages } = getPagination(page, limit, totalCount)

      const beachesFromDb = await db
        .select()
        .from(beaches)
        .where(and(...conditions))
        .orderBy(beaches.name)
        .limit(limit)
        .offset(offset)

      // Construir URL para la siguiente página
      const queryParams = new URLSearchParams(req.query as Record<string, string>)
      queryParams.set('page', String(page + 1))
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