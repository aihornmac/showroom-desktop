import Axios from 'axios'
import { API_URL } from './common'
import { Client } from './client'

/**
 * get room hot-spot information
 */
export async function getLiveTelop(
  _client: Client,
  options: GetLiveTelop.Options,
): Promise<GetLiveTelop.Response> {
  const url = `${API_URL}/live/telop`
  const res = await Axios.get<GetLiveTelop.Response>(url, {
    responseType: 'json',
    params: {
      room_id: options.roomId,
    },
  })
  return res.data
}

export namespace GetLiveTelop {
  export interface Options {
    roomId: number
  }

  export interface Response extends Response.RootObject {}

  export namespace Response {

    export interface Color {
      r: number
      g: number
      b: number
    }

    export interface Telop {
      color: Color
      text: string
      type: string
    }

    export interface RootObject {
      telops: Telop[]
      telop: string
      interval: number
    }

  }
}

// https://www.showroom-live.com/api/live/telop?room_id=267158
// {
//   "telops": [
//     {
//       "color": {
//         "r": 255,
//         "g": 255,
//         "b": 255
//       },
//       "text": "こんばんは！",
//       "type": "user"
//     }
//   ],
//   "telop": "こんばんは！",
//   "interval": 6000
// }
