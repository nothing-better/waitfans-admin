import { getData, postData } from './request'

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface AdminUser {
  uid: number
  username: string
  nickname: string
  avatar?: string
  state: number
  role: number
  auth: number
  authMsg?: string
  vip: number
  exp: number
  createDate?: string
}

export interface AdminComment {
  id: number
  vid: number
  uid: number
  content: string
  love: number
  bad: number
  rootId: number
  parentId: number
  isTop: number
  isDeleted: number
  createTime?: string
  nickname: string
  videoTitle: string
}

export interface AdminDanmu {
  id: number
  vid: number
  uid: number
  content: string
  fontsize: number
  mode: number
  color: string
  timePoint: number
  state: number
  createDate?: string
  nickname: string
  videoTitle: string
}

export interface AdminCategory {
  mcId: string
  scId: string
  mcName: string
  scName: string
  descr: string
  rcmTag: string
}

export interface HotSearchItem {
  content: string
  score: number
  type: number
}

export interface AdminOverview {
  counts: {
    users: number
    admins: number
    bannedUsers: number
    videos: number
    pendingVideos: number
    comments: number
    danmus: number
  }
  videoStatus: Record<string, number>
  trend: Array<{
    date: string
    label: string
    users: number
    videos: number
  }>
  categoryDistribution: Array<{
    name: string
    value: number
  }>
  recentUsers: AdminUser[]
  recentVideos: Array<{
    vid: number
    title: string
    nickname: string
    status: number
    uploadDate?: string
  }>
}

interface ListParams {
  keyword?: string
  page?: number
  pageSize?: number
}

export const getOverview = () =>
  getData<AdminOverview>('/admin/management/overview')

export const getUsers = (params: ListParams & { state?: number; role?: number }) =>
  getData<PageResult<AdminUser>>('/admin/management/users', { params })

export const updateUserState = (uid: number, state: number) =>
  postData<AdminUser>(`/admin/management/users/${uid}/state`, { state })

export const updateUserRole = (uid: number, role: number) =>
  postData<AdminUser>(`/admin/management/users/${uid}/role`, { role })

export const getComments = (
  params: ListParams & { vid?: number; deleted?: number },
) =>
  getData<PageResult<AdminComment>>('/admin/management/comments', { params })

export const deleteComment = (id: number) =>
  postData<null>(`/admin/management/comments/${id}/delete`)

export const getDanmus = (
  params: ListParams & { vid?: number; state?: number },
) =>
  getData<PageResult<AdminDanmu>>('/admin/management/danmus', { params })

export const deleteDanmu = (id: number) =>
  postData<null>(`/admin/management/danmus/${id}/delete`)

export const getCategories = () =>
  getData<AdminCategory[]>('/admin/management/categories')

export const updateCategory = (values: AdminCategory) =>
  postData<AdminCategory>('/admin/management/categories/update', values)

export const getHotSearch = () =>
  getData<HotSearchItem[]>('/admin/management/hot-search')

export const updateHotSearch = (keyword: string, score: number) =>
  postData<HotSearchItem[]>('/admin/management/hot-search/update', { keyword, score })

export const removeHotSearch = (keyword: string) =>
  postData<HotSearchItem[]>('/admin/management/hot-search/remove', { keyword })
