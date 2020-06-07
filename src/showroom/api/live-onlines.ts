import Axios from 'axios'
import { API_PREFIX } from './common'
import { Client } from './client'

/**
 * get info of rooms that are online
 */
export async function getLiveOnlines(
  _client: Client,
  _options?: GetLiveOnlines.Options,
): Promise<GetLiveOnlines.Response> {
  const url = `${API_PREFIX}/live/onlives`
  const res = await Axios.get<GetLiveOnlines.Response>(url, { responseType: 'json' })
  return res.data
}

export namespace GetLiveOnlines {
  export interface Options {}

  export interface Response extends Response.RootObject {}

  export namespace Response {

    export interface StreamingUrlList {
      is_default: boolean
      url: string
      label: string
      id: number
      type: string
      quality: number
    }

    export interface Life {
      room_url_key: string
      official_lv: number
      telop: string
      follower_num: number
      started_at: number
      live_id: number
      is_follow: boolean
      streaming_url_list: StreamingUrlList[]
      live_type: number
      tags: string[]
      image: string
      view_num: number
      genre_id: number
      main_name: string
      premium_room_type: number
      cell_type: number
      bcsvr_key: string
      room_id: number
      desc: string
      name: string
      sub_name: string
      color: string
    }

    export interface Onlife {
      genre_id: number
      banners: any[]
      has_upcoming: boolean
      genre_name: string
      lives: Life[]
    }

    export interface RootObject {
      corner_image_path: string
      onlives: Onlife[]
      bcsvr_port: number
      bcsvr_host: string
    }

  }
}
