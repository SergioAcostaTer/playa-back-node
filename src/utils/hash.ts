import { compare, hash } from 'bcrypt'

export const createHash = (string: string) => hash(string, 10)

export const compareHash = (string: string, hash: string) =>
  compare(string, hash)
