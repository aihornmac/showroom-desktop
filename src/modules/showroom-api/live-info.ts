import Axios from 'axios'
import { API_URL } from './common'
import { Client } from './client'

/**
 * get live information
 */
export async function getLiveInfo(
  _client: Client,
  options: GetLiveInfo.Options,
): Promise<GetLiveInfo.Response> {
  const url = `${API_URL}/live/live_info`
  const res = await Axios.get<GetLiveInfo.Response>(url, {
    responseType: 'json',
    params: {
      room_id: options.roomId,
    },
  })
  return res.data
}

export namespace GetLiveInfo {
  export interface Options {
    roomId: number
  }

  export interface Response extends Response.RootObject {}

  export namespace Response {

    export interface RootObject {
      enquete_gift_num: number
      is_enquete: boolean
      live_id: number
      is_enquete_result: boolean
      room_name: string
      background_image_url: string
      age_verification_status: number
      bcsvr_port: number
      video_type: number
      live_type: number
      is_free_gift_only: boolean
      premium_room_type: number
      bcsvr_host: string
      bcsvr_key: string
      room_id: number
      live_status: number
    }

  }
}

// https://www.showroom-live.com/api/live/live_info?room_id=267158&_=1591718643480

// offline
// {
//   "enquete_gift_num": 0,
//   "is_enquete": false,
//   "live_id": 0,
//   "is_enquete_result": false,
//   "room_name": "後藤萌咲【新アバ配布中！】まったりイベント中！！",
//   "background_image_url": "https://image.showroom-live.com/showroom-prod/assets/img/room/background/artist.png?v=2",
//   "age_verification_status": 0,
//   "bcsvr_port": 8080,
//   "video_type": 0,
//   "live_type": 0,
//   "is_free_gift_only": false,
//   "premium_room_type": 0,
//   "bcsvr_host": "online.showroom-live.com",
//   "bcsvr_key": "",
//   "room_id": 267158,
//   "live_status": 1
// }

// online
// {
//   "enquete_gift_num": 0,
//   "is_enquete": false,
//   "live_id": 9891057,
//   "is_enquete_result": false,
//   "room_name": "後藤萌咲【新アバ配布中！】まったりイベント中！！",
//   "background_image_url": "https://image.showroom-live.com/showroom-prod/assets/img/room/background/artist.png?v=2",
//   "age_verification_status": 0,
//   "bcsvr_port": 8080,
//   "video_type": 0,
//   "live_type": 0,
//   "is_free_gift_only": false,
//   "premium_room_type": 0,
//   "bcsvr_host": "online.showroom-live.com",
//   "bcsvr_key": "96ecf1:JXCKFZBu",
//   "room_id": 267158,
//   "live_status": 2
// }
