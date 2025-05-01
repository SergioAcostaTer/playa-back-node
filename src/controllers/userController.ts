import { IContextRequest, IUserRequest } from '@/contracts/request'
import { db } from '@/dataSources'
import { users } from '@/models'
import { eq } from 'drizzle-orm'
import { Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

export const userController = {
  me: async (
    { context: { user } }: IContextRequest<IUserRequest>,
    response: Response
  ) => {
    return response.status(StatusCodes.OK).json({
      data: user,
      message: ReasonPhrases.OK,
      status: StatusCodes.OK
    })
  },
  deleteMe: async (
    { context: { user } }: IContextRequest<IUserRequest>,
    response: Response
  ) => {
    try {
      await db.delete(users).where(eq(users.id, user.id)).execute()
    } catch (error) {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }

    return response.status(StatusCodes.OK).redirect(process.env.APP_URL)
  },
  updateMe: async (
    { context: { user }, body }: IContextRequest<IUserRequest>,
    response: Response
  ) => {
    try {
      await db.update(users).set(body).where(eq(users.id, user.id)).execute()
    } catch (error) {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }

    return response.status(StatusCodes.OK).json({
      data: body,
      message: ReasonPhrases.OK,
      status: StatusCodes.OK
    })
  }
}
