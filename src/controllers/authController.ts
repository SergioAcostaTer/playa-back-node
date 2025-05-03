import { Response, Request } from 'express';
import { jwtSign } from '@/utils/jwt';
import { StatusCodes } from 'http-status-codes';
import { userService } from '@/services/userService';
import { IGoogleUser } from '@/contracts/user';
import winston from 'winston';
import { setToken, clearToken } from '@/utils/cookies';
import { oauth2Client } from '@/config/googleOAuth';
import { db } from '@/dataSources';
import { sessions } from '@/models';
import bcrypt from 'bcrypt';

export const authController = {
  google: (_: Request, res: Response) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
    res.redirect(authUrl);
  },

  googleCallback: async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) {
      return res.status(StatusCodes.BAD_REQUEST).send('Error: Code not provided');
    }
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      oauth2Client.setCredentials(tokens);
      const { data } = await oauth2Client.request<IGoogleUser>({
        url: 'https://www.googleapis.com/oauth2/v1/userinfo',
      });
      const existingUser = await userService.getUserByGoogleId(data.id);
      const user = existingUser ?? (await userService.createUser(data));
      const { accessToken } = jwtSign(user.id);
      setToken(res, accessToken);
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      await db.insert(sessions).values({ userId: user.id }).execute();
      return res.status(StatusCodes.OK).redirect(process.env.CLIENT_URL);
    } catch (error: any) {
      winston.error('Error during OAuth callback:', { message: error.message, stack: error.stack });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error during OAuth callback');
    }
  },

  register: async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields',
      });
    }
    try {
      const user = await userService.createUserWithPassword({ email, password, name });
      const { accessToken } = jwtSign(user.id);
      setToken(res, accessToken);
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      await db.insert(sessions).values({ userId: user.id }).execute();
      return res.status(StatusCodes.CREATED).json({ message: 'User registered', user });
    } catch (error: any) {
      winston.error('Error during user registration:', { message: error.message, stack: error.stack });
      if (error.message === 'Email already exists' || error.code === '23505') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Email already exists',
        });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to register user',
      });
    }
  },

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Email and password are required',
      });
    }
    try {
      const user = await userService.getUserByEmail(email);
      if (!user || !user.password) {
        console.log('User not found or no password:', { email, userExists: !!user });
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: 'Invalid email or password',
        });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', { email, isPasswordValid });
      if (!isPasswordValid) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: 'Invalid email or password',
        });
      }
      const { accessToken } = jwtSign(user.id);
      setToken(res, accessToken);
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      await db.insert(sessions).values({ userId: user.id }).execute();
      return res.status(StatusCodes.OK).json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: any) {
      winston.error('Error during login:', { message: error.message, stack: error.stack });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to login user',
      });
    }
  },

  logOut: async (_: Request, res: Response) => {
    try {
      clearToken(res);
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'Successfully logged out',
      });
    } catch (error: any) {
      winston.error('Error during logout:', { message: error.message, stack: error.stack });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred during sign-out',
      });
    }
  },
};