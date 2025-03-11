import { Response } from 'express'

// Utility function to set the JWT token in the cookie
export const setToken = (res: Response, token: string): Response => {
  if (!token) {
    throw new Error('Token must be provided')
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as 'strict' | 'lax' | 'none',
    maxAge: 1000 * 60 * 60 * 24 * 7 // Cookie valid for 7 days
  }

  return res.cookie('token', token, cookieOptions)
}

// Utility function to clear the token from the cookie
export const clearToken = (res: Response): Response => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as 'strict' | 'lax' | 'none'
  }

  return res.clearCookie('token', cookieOptions)
}
