import jwt from 'jsonwebtoken'

import { IAccessToken, IJwtUser } from '@/contracts/jwt'

export const jwtSign = (id: number): IAccessToken => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION
  })

  return { accessToken }
}

export const jwtVerify = ({ accessToken }: { accessToken: string }) => {
  return jwt.verify(accessToken, process.env.JWT_SECRET) as IJwtUser
}
