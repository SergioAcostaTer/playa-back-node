import { Response, Request } from 'express'
import { userService } from '@/services/userService'
import { jwtSign } from '@/utils/jwt'
import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import { redis } from '@/dataSources'
import { UserMail } from '@/mailer'

export const authController = {
  signIn: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body
      const user = await userService.getByEmail(email)

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          message: 'User not found'
        })
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
      if (!isPasswordValid) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: StatusCodes.UNAUTHORIZED,
          message: 'Invalid email or password'
        })
      }

      const { accessToken } = jwtSign(user.id)
      res.setHeader('Authorization', `Bearer ${accessToken}`)

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'Sign-in successful',
        data: { accessToken }
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred during sign-in'
      })
    }
  },

  signUp: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      if (await userService.isExistByEmail(email)) {
        return res.status(StatusCodes.CONFLICT).json({
          status: StatusCodes.CONFLICT,
          message: 'Email is already registered'
        })
      }

      const newUser = await userService.create(email, password)
      if (!newUser) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'User creation failed. Please try again later.'
        })
      }

      const { accessToken } = jwtSign(newUser.id)
      res.setHeader('Authorization', `Bearer ${accessToken}`)

      const userMail = new UserMail()
      await userMail.signUp({ email })

      return res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        message: 'User registered successfully',
        data: { accessToken }
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred during sign-up'
      })
    }
  },

  signOut: async (req: Request, res: Response) => {
    try {
      const { accessToken } = req.body

      if (!accessToken) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: 'Access token is required for sign-out'
        })
      }

      await redis.client.set(`expiredToken:${accessToken}`, '1', {
        EX: process.env.REDIS_TOKEN_EXPIRATION
      })

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'Successfully signed out'
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred during sign-out'
      })
    }
  }
}
