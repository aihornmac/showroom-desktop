import Axios from 'axios'
import { API_PREFIX } from './common'
import { Client } from './client'
import { getDayStartTimstamp } from '../../utils/time'

// https://www.showroom-live.com/api/time_table/time_tables?order=asc&started_at=1591459200&_=1591509960604

/**
 * get info of rooms that are online
 */
export async function getTimeTables(
  _client: Client,
  options?: GetTimeTables.Options,
): Promise<GetTimeTables.Response> {
  const url = `${API_PREFIX}/time_table/time_tables`

  const order = options?.order || 'asc'
  const started_at = Math.floor((options?.startedAt || getDayStartTimstamp(Date.now())) / 1000)

  const res = await Axios.get<GetTimeTables.Response>(url, {
    responseType: 'json',
    params: { order, started_at }
  })

  return res.data
}

export namespace GetTimeTables {
  export interface Options {
    /**
     * time table order
     * @default asc
     */
    readonly order?: 'asc' | 'desc'
    /**
     * started time in ms
     * @default currentTimestamp
     */
    readonly startedAt?: number
  }

  export type Response = Response.RootObject

  export namespace Response {

    export interface Label {
      color: string;
      text: string;
    }

    export interface TimeTable {
      is_follow: boolean;
      room_url_key: string;
      image: string;
      view_num: number;
      pickup: boolean;
      main_name: string;
      started_at: number;
      premium_room_type: number;
      is_onlive: boolean;
      label: Label;
      room_id: number;
    }

    export interface RootObject {
      time_tables: TimeTable[];
    }

  }
}
