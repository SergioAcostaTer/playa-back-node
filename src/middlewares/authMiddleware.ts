import { NextFunction, Request, Response } from 'express'

import { getTokenFromCookie } from '@/utils/headers'
import { jwtVerify } from '@/utils/jwt'
import { userService } from '@/services/userService'
import winston from 'winston'
import { consola } from 'consola-mini'

export const authMiddleware = async (
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    Object.assign(req, { context: {} })

    const accessToken = getTokenFromCookie(req)
    if (!accessToken) return next()

    const  res = jwtVerify({ accessToken })
    const { id } = res
    if (!id) return next()

    const user = await userService.getUserById(id)

    if (!user) return next()

    Object.assign(req, {
      context: {
        user,
        accessToken
      }
    })

    return next()
  } catch (error) {
    return next()
  }
}
