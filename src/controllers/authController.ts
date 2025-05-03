import { Response, Request } from 'express'
import { jwtSign } from '@/utils/jwt'
import { StatusCodes } from 'http-status-codes'
import { userService } from '@/services/userService'
import { IGoogleUser } from '@/contracts/user'
import winston from 'winston'
import { setToken, clearToken } from '@/utils/cookies'
import { oauth2Client } from '@/config/googleOAuth'
import { db } from '@/dataSources'
import { sessions } from '@/models'
import bcrypt from 'bcrypt'

export const authController = {
  google: (_: Request, res: Response) => {
    // Generate the Google OAuth2 authentication URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    })

    res.redirect(authUrl)
  },

  googleCallback: async (req: Request, res: Response) => {
    const { code } = req.query

    if (!code) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('Error: Code not provided')
    }

    try {
      // Exchange the code for tokens
      const { tokens } = await oauth2Client.getToken(code as string)
      oauth2Client.setCredentials(tokens)

      // Get user info from Google
      const { data } = await oauth2Client.request<IGoogleUser>({
        url: 'https://www.googleapis.com/oauth2/v1/userinfo'
      })

      // Check if user exists in the database
      const existingUser = await userService.getUserByGoogleId(data.id)

      if (existingUser) {
        // If user exists, generate a JWT token
        const { accessToken } = jwtSign(existingUser.id)
        res.setHeader('Authorization', `Bearer ${accessToken}`)

        await db
          .insert(sessions)
          .values({
            userId: existingUser.id
          })
          .execute()

        // Set the token in the cookie
        setToken(res, accessToken)

        return res.status(StatusCodes.OK).redirect(process.env.CLIENT_URL)
      }

      // If the user doesn't exist, create a new user
      const savedUser = await userService.createUser(data)
      const { accessToken } = jwtSign(savedUser.id)

      res.setHeader('Authorization', `Bearer ${accessToken}`)
      setToken(res, accessToken)

      winston.info('User created successfully')

      await db
        .insert(sessions)
        .values({
          userId: savedUser.id
        })
        .execute()

      return res.status(StatusCodes.OK).redirect(process.env.CLIENT_URL)
    } catch (error) {
      winston.error('Error during OAuth callback: ', error)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send('Error during OAuth callback')
    }
  },

  register: async (req: Request, res: Response) => {
    const { email, password, name, lastname } = req.body

    if (!email || !password || !name || !lastname) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields'
      })
    }

    try {
      const user = await userService.createUserWithPassword({ email, password, name, lastname })
      return res.status(StatusCodes.CREATED).json(user)
    } catch (error) {
      winston.error('Error during user registration:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to register user'
      })
    }
  },

  logOut: async (_: Request, res: Response) => {
    try {
      clearToken(res)
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'Successfully logged out'
      })
    } catch (error) {
      winston.error('Error during logout: ', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred during sign-out'
      })
    }
  },

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body
  
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Email and password are required'
      })
    }
  
    try {
      const user = await userService.getUserByEmail(email)
  
      if (!user || !user.passwordHash) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: 'Invalid email or password'
        })
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  
      if (!isPasswordValid) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: 'Invalid email or password'
        })
      }
  
      const { accessToken } = jwtSign(user.id)
      setToken(res, accessToken)
      res.setHeader('Authorization', `Bearer ${accessToken}`)
  
      await db.insert(sessions).values({ userId: user.id }).execute()
  
      return res.status(StatusCodes.OK).json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })
    } catch (error) {
      winston.error('Error during login:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to login user'
      })
    }
  }
  
}
