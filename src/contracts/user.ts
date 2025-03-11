export interface IUser {
  id: number
  name: string
  username: string
  email: string
  googleHash?: string
  createdAt: Date
  avatarUrl?: string
}

export interface IGoogleUser {
  id: string
  name: string
  email: string
  picture: string
}

export interface IUserMethods {
  comparePassword: (password: string) => boolean
}
