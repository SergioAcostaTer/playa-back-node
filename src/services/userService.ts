import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { postgres, redis } from '@/dataSources'
import { roles, users } from '@/models/users/schema'

const CACHE_EXPIRATION = {
  USER: 3600,
  ROLE: 86400
}

export const userService = {
  async create(email: string, password: string, roleId = 4) {
    const hashedPassword = await bcrypt.hash(password, 10)

    const [newUser] = await postgres
      .insert(users)
      .values({
        email,
        passwordHash: hashedPassword,
        roleId,
        name: email.split('@')[0]
      })
      .returning()

    if (!newUser) return null

    await redis.client.set(`user_role_${newUser.id}`, String(roleId), {
      EX: CACHE_EXPIRATION.ROLE
    })

    return newUser
  },

  async getById(userId: number) {
    const cachedUser = await redis.client.get(`user_${userId}`)
    if (cachedUser) return JSON.parse(cachedUser)

    const user = await postgres
      .select({
        email: users.email,
        name: users.name,
        roleId: users.roleId,
        roleName: roles.name
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1)

    const userData = user.at(0) ?? null
    if (userData) {
      await redis.client.set(`user_${userId}`, JSON.stringify(userData), {
        EX: CACHE_EXPIRATION.USER
      })
    }

    return userData
  },

  async getByEmail(email: string) {
    const user = await postgres
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    return user.at(0) ?? null
  },

  async isExistByEmail(email: string) {
    const user = await postgres
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    return user.length > 0
  },

  async updatePassword(userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await postgres
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.id, userId))

    await redis.client.del(`user_${userId}`)
  },

  async deleteById(userId: number) {
    await postgres.delete(users).where(eq(users.id, userId))
    await redis.client.del(`user_${userId}`)
    await redis.client.del(`user_role_${userId}`)
  }
}
