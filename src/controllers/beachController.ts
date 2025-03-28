import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/dataSources'
import { beaches } from '@/models/beaches'
import { eq, ilike, and, count, SQL, ne } from 'drizzle-orm'
import { URL } from 'url'
import { apiConfig } from '@/config/config'

const buildFilterConditions = (query: Record<string, any>) => {
  const filters: SQL[] = [];

  const filterMap = {
    name: 
      query.name 
        ? ilike(beaches.name, `%${query.name}%`) 
        : undefined,
    island: 
      query.island 
        ? ilike(beaches.island, `%${query.island}%`) 
        : undefined,
    province: 
      query.province 
        ? ilike(beaches.province, `%${query.province}%`) 
        : undefined,
    hasMixedComposition:
      query.hasMixedComposition !== undefined && query.hasMixedComposition !== ''
        ? eq(beaches.hasMixedComposition, query.hasMixedComposition === 'true')
        : undefined,
    sportsArea:
      query.sportsArea !== undefined && query.sportsArea !== ''
        ? eq(beaches.sportsArea, query.sportsArea === 'true')
        : undefined,
    wheelchairAccess:
      query.wheelchairAccess !== undefined && query.wheelchairAccess !== ''
        ? eq(beaches.wheelchairAccess, query.wheelchairAccess === 'true')
        : undefined,
    hasAdaptedShowers:
      query.hasAdaptedShowers !== undefined && query.hasAdaptedShowers !== ''
        ? eq(beaches.hasAdaptedShowers, query.hasAdaptedShowers === 'true')
        : undefined,
    hasRock:
      query.hasRock !== undefined && query.hasRock !== ''
        ? eq(beaches.hasRock, query.hasRock === 'true')
        : undefined,
    hasSand:
      query.hasSand !== undefined && query.hasSand !== ''
        ? eq(beaches.hasSand, query.hasSand === 'true')
        : undefined,
    lifeguard:
      query.lifeguard !== undefined && query.lifeguard !== ''
        ? query.lifeguard === 'true'
          ? ne(beaches.lifeguardService, '')
          : eq(beaches.lifeguardService, '')
        : undefined,
  };

  return Object.values(filterMap).filter(
    (condition): condition is SQL => condition !== undefined
  );
};

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

      const baseQuery = db.select().from(beaches)
      const countQuery = db.select({ count: count() }).from(beaches)

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
              `/beaches?${queryParams.toString()}`,
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

  // getBeachById: async (req: Request, res: Response) => {
  //   try {
  //     const beachId = Number(req.params.id)
  //     const beachFromDb = await db
  //       .select()
  //       .from(beaches)
  //       .where(eq(beaches.id, beachId))
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
        .from(beaches)
        .where(ilike(beaches.slug, slug))
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
        conditions.push(ilike(beaches.name, `%${q}%`))
      }

      // Agregar filtros adicionales con condiciones flexibles
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

      const queryParams = new URLSearchParams(
        req.query as Record<string, string>
      )
      queryParams.set('page', String(Number(page) + 1))
      queryParams.set('limit', String(limit))

      const nextPage =
        page < totalPages
          ? new URL(
              `/beaches/search?${queryParams.toString()}`,
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
