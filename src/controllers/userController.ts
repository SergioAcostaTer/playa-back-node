import { Response } from 'express'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { IContextRequest, IUserRequest } from '@/contracts/request'
import { db } from '@/dataSources'
import { users } from '@/models'
import { eq } from 'drizzle-orm'

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
    } catch (error: any) {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }

    return response.status(StatusCodes.OK).redirect(process.env.APP_URL)
  }
}
