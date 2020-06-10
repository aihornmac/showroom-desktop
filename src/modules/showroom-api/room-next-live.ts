import Axios from 'axios'
import { API_URL } from './common'
import { Client } from './client'

/**
 * get room hot-spot information
 */
export async function getRoomNextLine(
  _client: Client,
  options: GetRoomNextLine.Options,
): Promise<GetRoomNextLine.Response> {
  const url = `${API_URL}/room/next_live`
  const res = await Axios.get<GetRoomNextLine.Response>(url, {
    responseType: 'json',
    params: {
      room_id: options.roomId,
      ignore_low_stream: options.ignoreLowStream ? 1 : undefined,
    },
  })
  return res.data
}

export namespace GetRoomNextLine {
  export interface Options {
    roomId: number
    ignoreLowStream?: boolean
  }

  export interface Response extends Response.RootObject {}

  export namespace Response {

    export interface RootObject {
      epoch: number | null
      text: string
    }

  }
}

// https://www.showroom-live.com/api/room/next_live?room_id=267158
// {
//   "epoch": null,
//   "text": "未定"
// }
