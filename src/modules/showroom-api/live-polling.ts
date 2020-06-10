import Axios from 'axios'
import { API_URL } from './common'
import { Client } from './client'

/**
 * get room hot-spot information
 */
export async function getLivePolling(
  _client: Client,
  options: GetLivePolling.Options,
): Promise<GetLivePolling.Response> {
  const url = `${API_URL}/live/polling`
  const res = await Axios.get<GetLivePolling.Response>(url, {
    responseType: 'json',
    params: {
      room_id: options.roomId,
    },
  })
  return res.data
}

export namespace GetLivePolling {
  export interface Options {
    roomId: number
  }

  export interface Response extends Response.RootObject {}

  export namespace Response {

    export interface LiveWatchIncentive {}

    export interface RootObject {
      is_login: boolean
      show_login_dialog: number
      online_user_num: number
      live_watch_incentive: LiveWatchIncentive
    }

  }
}
