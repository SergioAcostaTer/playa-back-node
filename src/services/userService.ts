import { IGoogleUser } from '@/contracts/user';
import { db } from '@/dataSources';
import { users } from '@/models/users';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export const userService = {
  async createUser(user: IGoogleUser) {
    const userToSave = {
      googleHash: user.id,
      email: user.email,
      name: user.name,
      username: user.email.split('@')[0],
      avatarUrl: user.picture,
      password: null,
    };
    const [userFromDb] = await db.insert(users).values(userToSave).returning();
    return userFromDb;
  },

  async createUserWithPassword({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }) {
    const existingUser = await db.query.users.findFirst({
      where: (user: { email: any }, { eq }: any) => eq(user.email, email),
    });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const username = name.trim().toLowerCase().replace(/\s+/g, '_');

    const userToSave = {
      email,
      name,
      username,
      avatarUrl: null,
      googleHash: null,
      password: passwordHash,
    };

    const [userFromDb] = await db.insert(users).values(userToSave).returning();
    return userFromDb;
  },

  async getUserByGoogleId(googleHash: string) {
    return await db.query.users.findFirst({
      where: (user: { googleHash: any }, { eq }: any) => eq(user.googleHash, googleHash),
    });
  },

  async getUserById(id: number) {
    return await db.query.users.findFirst({
      where: (user: { id: any }, { eq }: any) => eq(user.id, id),
    });
  },

  async getUserByEmail(email: string) {
    const user = await db.query.users.findFirst({
      where: (user: { email: any }, { eq }: any) => eq(user.email, email),
    });
    return user;
  },
};