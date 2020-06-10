import Axios from 'axios'
import { WEBSITE_URL, getFakeMobileHeaders } from './common'

export async function getRoomIdByRoomUrlKey(urlKey: string) {
  const url = `${WEBSITE_URL}/${urlKey}`
  const res = await Axios.get<string>(url, {
    headers: getFakeMobileHeaders(),
    responseType: 'text',
    validateStatus(status) {
      return status >= 200 && status < 300 || status === 404
    },
  })
  if (res.status === 404) return
  const html = res.data
  const matchId = html.match(/room\?room_id\=(\d+)/)
  if (!matchId) {
    throw new Error(`Can't find id in showroom page ${url}`)
  }
  return +matchId[1]
}
