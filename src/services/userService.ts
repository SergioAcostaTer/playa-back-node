import { IGoogleUser } from '@/contracts/user'
import { db } from '@/dataSources'
import { users } from '@/models/users'

export const userService = {
  async createUser(user: IGoogleUser) {
    const userToSave = {
      googleHash: user.id,
      email: user.email,
      name: user.name,
      username: user.email.split('@')[0],
      avatarUrl: user.picture
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
