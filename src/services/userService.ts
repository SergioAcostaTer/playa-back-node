import { IGoogleUser } from '@/contracts/user'
import { db } from '@/dataSources'
import { users } from '@/models/users'
import bcrypt from 'bcrypt'

export const userService = {
  async createUser(user: IGoogleUser) {
    const userToSave = {
      googleHash: user.id,
      email: user.email,
      name: user.name,
      username: user.email.split('@')[0],
      avatarUrl: user.picture,
      passwordHash: null
    }
    const [userFromDb] = await db.insert(users).values(userToSave).returning()
    return userFromDb
  },

  async createUserWithPassword({
    email,
    password,
    name,
    lastname
  }: {
    email: string
    password: string
    name: string, 
    lastname: string
  }) {
    const passwordHash = await bcrypt.hash(password, 10)

    const userToSave = {
      email,
      name,
      lastname,
      username: email.split('@')[0],
      avatarUrl: null,
      googleHash: null,
      passwordHash
    }

    const [userFromDb] = await db.insert(users).values(userToSave).returning()
    return userFromDb
  },

  async getUserByGoogleId(googleHash: string) {
    return await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.googleHash, googleHash)
    })
  },
  async getUserById(id: number) {
    return await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, id)
    })
  }
}
