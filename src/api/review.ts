import { getData, postData } from './request'

export interface ReviewVideo {
  video: {
    vid: number
    title: string
    coverUrl?: string
    videoUrl?: string
    uploadDate?: string
    status: number
    type?: number
    auth?: number
    tags?: string
    descr?: string
  }
  user: {
    uid: number
    nickname: string
    avatar_url?: string
  }
  category?: {
    mcName?: string
    scName?: string
  }
}

export const getReviewTotal = (status: number) =>
  getData<number>('/review/video/total', { params: { vstatus: status } })

export const getReviewVideos = (status: number, page: number, quantity = 10) =>
  getData<ReviewVideo[]>('/review/video/getpage', {
    params: { vstatus: status, page, quantity },
  })

export const getReviewVideo = (vid: number | string) =>
  getData<ReviewVideo>('/review/video/getone', { params: { vid } })

export const updateReviewStatus = (vid: number | string, status: number) => {
  const data = new FormData()
  data.append('vid', String(vid))
  data.append('status', String(status))
  return postData<unknown>('/video/change/status', data)
}
