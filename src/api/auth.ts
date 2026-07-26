import request, { getData, postData, TOKEN_KEY } from './request'
import type { User } from '@/types/user'

export interface Credentials {
  username: string
  password: string
}

export interface LoginPayload {
  token: string
  user: User
}

export const login = (values: Credentials) =>
  postData<LoginPayload>('/admin/account/login', values)

export const getPersonalInfo = () => getData<User>('/admin/personal/info')

export async function logout() {
  try {
    await request.get('/admin/account/logout')
  } finally {
    localStorage.removeItem(TOKEN_KEY)
  }
}
