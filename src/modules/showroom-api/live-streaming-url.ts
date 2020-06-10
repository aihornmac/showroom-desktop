import Axios from 'axios'
import { API_URL } from './common'
import { Client } from './client'

/**
 * get room hot-spot information
 */
export async function getLiveStreamingUrl(
  _client: Client,
  options: GetLiveStreamingUrl.Options,
): Promise<GetLiveStreamingUrl.Response> {
  const url = `${API_URL}/live/streaming_url`
  const res = await Axios.get<GetLiveStreamingUrl.Response>(url, {
    responseType: 'json',
    params: {
      room_id: options.roomId,
      ignore_low_stream: options.ignoreLowStream ? 1 : undefined,
    },
  })
  return res.data
}

export namespace GetLiveStreamingUrl {
  export interface Options {
    roomId: number
    ignoreLowStream?: boolean
  }

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

    export interface RootObject {
      /**
       * is undefined when live is not open
       */
      streaming_url_list?: StreamingUrlList[]
    }

  }
}

// https://www.showroom-live.com/api/live/streaming_url?room_id=267158&ignore_low_stream=1&_=1591718643482
// {
//   "streaming_url_list": [
//     {
//       "is_default": true,
//       "url": "https://hls-origin228.showroom-cdn.com/liveedge/298453e4053b21c1c996b4644681ede96ced0783d068fdbbcd7871731c73b046/chunklist.m3u8",
//       "label": "stable stream",
//       "id": 2,
//       "type": "hls",
//       "quality": 1500
//     },
//     {
//       "is_default": true,
//       "url": "https://hls-ull.showroom-cdn.com/298453e4053b21c1c996b4644681ede96ced0783d068fdbbcd7871731c73b046/source/chunklist.m3u8",
//       "label": "low latency stream",
//       "id": 1,
//       "type": "lhls",
//       "quality": 1000
//     }
//   ]
// }
