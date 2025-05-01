import { IContextRequest, IUserRequest } from '@/contracts/request'
import { IUser } from '@/contracts/user'
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
    if (!user?.id) {
      return response.status(StatusCodes.UNAUTHORIZED).json({
        message: ReasonPhrases.UNAUTHORIZED,
        status: StatusCodes.UNAUTHORIZED
      })
    }

    // Whitelist fields allowed to be updated
    const { name, username, email, avatarUrl } = body
    const updates: Partial<IUser> = {}
    if (name) updates.name = name
    if (username) updates.username = username
    if (email) updates.email = email
    if (avatarUrl) updates.avatarUrl = avatarUrl

    try {
      await db.update(users).set(updates).where(eq(users.id, user.id)).execute()
    } catch (error) {
      console.error('Update error:', error)
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }

    return response.status(StatusCodes.OK).json({
      data: updates,
      message: ReasonPhrases.OK,
      status: StatusCodes.OK
    })
  }
}
