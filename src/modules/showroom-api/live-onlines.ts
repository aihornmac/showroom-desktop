import Axios from 'axios'
import { API_URL } from './common'
import { Client } from './client'

/**
 * get info of rooms that are online
 */
export async function getLiveOnlines(
  _client: Client,
  _options?: GetLiveOnlines.Options,
): Promise<GetLiveOnlines.Response> {
  const url = `${API_URL}/live/onlives`
  const res = await Axios.get<GetLiveOnlines.Response>(url, { responseType: 'json' })
  return res.data
}

export namespace GetLiveOnlines {
  export interface Options {}

  export type Response = Response.RootObject

  export namespace Response {

    export interface StreamingUrlList {
      is_default: boolean
      url: string
      label: string
      id: number
      type: string
      quality: number
    }

    export type Live = {
      cell_type: 0
      name: string
      desc?: string
    } | {
      cell_type: 7
      message: string
    } | {
      cell_type: 100
      room_url_key: string
      official_lv: number
      telop: string
      follower_num: number
      started_at: number
      live_id: number
      is_follow: boolean
      streaming_url_list: StreamingUrlList[]
      live_type: number
      tags: unknown[]
      image: string
      view_num: number
      genre_id: number
      main_name: string
      premium_room_type: number
      bcsvr_key: string
      room_id: number
    } | {
      cell_type: 102
      room_url_key: string
      official_lv: number
      sub_name: string
      telop: string
      color: string
      follower_num: number
      started_at: number
      live_id: number
      is_follow: boolean
      streaming_url_list: StreamingUrlList[]
      live_type: number
      tags: unknown[]
      image: string
      view_num: number
      genre_id: number
      main_name: string
      premium_room_type: number
      bcsvr_key: string
      room_id: number
    }

    export interface Onlive {
      genre_id: number
      banners: unknown[]
      has_upcoming: boolean
      genre_name: string
      lives: Live[]
    }

    export interface RootObject {
      corner_image_path: string
      onlives: Onlive[]
      bcsvr_port: number
      bcsvr_host: string
    }

  }
}

// https://www.showroom-live.com/api/live/onlives
// {
//   "corner_image_path": "https://image.showroom-live.com/showroom-prod/assets/img/corner/",
//   "onlives": [
//     {
//       "genre_id": 0,
//       "banners": [],
//       "has_upcoming": false,
//       "genre_name": "人氣",
//       "lives": [
//         {
//           "room_url_key": "a-light100",
//           "official_lv": 1,
//           "telop": "Popteenオーディション決勝！！",
//           "follower_num": 710,
//           "started_at": 1591732802,
//           "live_id": 9891848,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin207.showroom-cdn.com/liveedge/0d2c46e5c15211d6d8ab521a6de68f1a8a94761e2bc640a20b182735dc556485_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/54ad2e89d7411391508811e3abe638996fd536af95dd2ba4e7aa0f064f4b32cf_s.jpeg?v=1591701141",
//           "view_num": 653,
//           "genre_id": 103,
//           "main_name": "【アバター配布ガチイベ決勝！！】るーりるroom",
//           "premium_room_type": 0,
//           "cell_type": 100,
//           "bcsvr_key": "96f008:5lLwQQqf",
//           "room_id": 287985
//         },
//         {
//           "room_url_key": "292372",
//           "official_lv": 1,
//           "telop": "♡7:00すぎまで♡次枠明日7:00〜",
//           "follower_num": 598,
//           "started_at": 1591732818,
//           "live_id": 9891863,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin231.showroom-cdn.com/liveedge/8f18bc69523fb07b165b970fd287b54a55f54655be4185c6b38f026b6dbb44d4_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/e15bfc162dde4d8eb0a1681268db92406f337819ec9b72288baa2b9b384684e5_s.jpeg?v=1591461117",
//           "view_num": 680,
//           "genre_id": 103,
//           "main_name": "ななみるく◢⁴⁶",
//           "premium_room_type": 0,
//           "cell_type": 100,
//           "bcsvr_key": "96f017:ZOWDaGIw",
//           "room_id": 301199
//         },
//         {
//           "room_url_key": "48_Rira_Miyazato",
//           "official_lv": 1,
//           "telop": "気づけば朝",
//           "follower_num": 10247,
//           "started_at": 1591732848,
//           "live_id": 9891870,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin277.showroom-cdn.com/liveedge/9bf6040aeccea198316c6b82b8839de52e71c3e49aab53eb5c6237799f26ebef_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/392898e68da294b3d083ebb2711a8b8b96039223d818f1bc704616d307f37952_s.png?v=1587727596",
//           "view_num": 2369,
//           "genre_id": 102,
//           "main_name": "宮里 莉羅（AKB48 チーム８）",
//           "premium_room_type": 0,
//           "cell_type": 100,
//           "bcsvr_key": "96f01e:YnxE6uFZ",
//           "room_id": 61805
//         }
//       ]
//     },
//     {
//       "genre_id": 703,
//       "banners": [],
//       "has_upcoming": false,
//       "genre_name": "Karaoke",
//       "lives": [
//         {
//           "desc": "オンライブ中にSHOWROOMのカラオケ機能で歌唱をスタートするごとに15分間そのルームが表示されます。",
//           "name": "Karaoke",
//           "cell_type": 0
//         },
//         {
//           "room_url_key": "96d611444438",
//           "official_lv": 0,
//           "telop": "♪ 最後のサヨナラ",
//           "follower_num": 83,
//           "started_at": 1591733488,
//           "live_id": 9891892,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin204.showroom-cdn.com/liveedge/57459aa929bd4d2ba83acc809c966888929779a0a50ba678655bc672ed7acdfc_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/5df105d2c5b13d70101886be3181320463d2e7464e4a2775be35ea7d24c8dd99_s.png?v=1591654152",
//           "view_num": 44,
//           "genre_id": 200,
//           "main_name": "～こはるのゆるーい配信～",
//           "premium_room_type": 0,
//           "cell_type": 100,
//           "bcsvr_key": "96f034:k1dIZ5M1",
//           "room_id": 284039
//         },
//         {
//           "room_url_key": "030ca3966095",
//           "official_lv": 0,
//           "telop": "♪ マリーゴールド",
//           "follower_num": 13,
//           "started_at": 1591734683,
//           "live_id": 9891927,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin207.showroom-cdn.com/liveedge/856978d68126e74867b79dc92ba503d0d8b77f63094a43425b9b28e0c7e47e78_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/639546ff504f9e021d36356909f90b279dd43d481a16948ef99dbfd9a80f7371_s.png?v=1591652475",
//           "view_num": 13,
//           "genre_id": 200,
//           "main_name": "ドラちゃん23号の憩い部屋(カラオケイベ参加中)",
//           "premium_room_type": 0,
//           "cell_type": 100,
//           "bcsvr_key": "96f057:lx1uK8vK",
//           "room_id": 312239
//         }
//       ]
//     },
//     {
//       "genre_id": 704,
//       "banners": [],
//       "has_upcoming": true,
//       "genre_name": "MEN'S",
//       "lives": [
//         {
//           "desc": "一定の条件を満たした男性配信者のルームが表示されます。 \nまた、表示されているルームのうち連続配信日数の上位ルームは、上部に表示されます。",
//           "name": "MEN'S",
//           "cell_type": 0
//         },
//         {
//           "room_url_key": "ht33jb0044",
//           "official_lv": 1,
//           "sub_name": "84 days in a row",
//           "telop": "ガチイベ3日目の1枠目！次枠14:30！",
//           "color": "#aace36",
//           "follower_num": 252,
//           "started_at": 1591734606,
//           "live_id": 9891916,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin239.showroom-cdn.com/liveedge/d7b0f4f2bf8f71daec2202c9098e95c3b195ff7da09da5f8d3e4691243094a30_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/c0d21c34bf937cf7d02be73c81a5b62247178381612f272d8f21517b64b43227_s.jpeg?v=1591534810",
//           "view_num": 62,
//           "genre_id": 103,
//           "main_name": "【蘇生リーグ6/8〜】藤田凜@ジュノンボーイ挑戦中",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96f04c:u9Sof05T",
//           "room_id": 293008
//         },
//         {
//           "room_url_key": "rg_ruki_jinguji",
//           "official_lv": 1,
//           "sub_name": "21 days in a row",
//           "telop": "まったり(*´ー｀*)",
//           "color": "#ffe100",
//           "follower_num": 165,
//           "started_at": 1591728630,
//           "live_id": 9891792,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin209.showroom-cdn.com/liveedge/680178db21266d7aa5e2dd82c1ad504855117e502ebeca1935dcf1c2b319d1a9_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/a3f7cc0624db1c2225ede550939b2cb15caff42365180c105cbaea95f6eaa639_s.jpeg?v=1591455359",
//           "view_num": 491,
//           "genre_id": 105,
//           "main_name": "神宮寺瑠姫（RAINGROUP：ROMEO＆JURIET）",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96efd0:GvnrSjmY",
//           "room_id": 285690
//         }
//       ]
//     },
//     {
//       "genre_id": 801,
//       "banners": [],
//       "has_upcoming": false,
//       "genre_name": "✰台灣✰",
//       "lives": [
//         {
//           "cell_type": 7,
//           "message": "目前沒有任何場地正在舉辦實況表演。"
//         }
//       ]
//     },
//     {
//       "genre_id": 102,
//       "banners": [],
//       "has_upcoming": true,
//       "genre_name": "偶像",
//       "lives": [
//         {
//           "desc": "每天直播15分鐘(900秒)以上的場地 *Non-stop broadcasting starts/ends at 3 am everyday. If the show started between 0:00:00 -02.59:00, it will be counted as the previous day's show.",
//           "name": "每日偶像",
//           "cell_type": 0
//         },
//         {
//           "room_url_key": "48_Rira_Miyazato",
//           "official_lv": 1,
//           "sub_name": "每日偶像！",
//           "telop": "気づけば朝",
//           "color": "#ffe100",
//           "follower_num": 10247,
//           "started_at": 1591732848,
//           "live_id": 9891870,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin277.showroom-cdn.com/liveedge/9bf6040aeccea198316c6b82b8839de52e71c3e49aab53eb5c6237799f26ebef_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/392898e68da294b3d083ebb2711a8b8b96039223d818f1bc704616d307f37952_s.png?v=1587727596",
//           "view_num": 2369,
//           "genre_id": 102,
//           "main_name": "宮里 莉羅（AKB48 チーム８）",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96f01e:YnxE6uFZ",
//           "room_id": 61805
//         },
//         {
//           "room_url_key": "SSC_MiNAMi",
//           "official_lv": 1,
//           "sub_name": "每日偶像！",
//           "telop": "初見さん大歓迎！！星投げカウントお願いします！",
//           "color": "#ffe100",
//           "follower_num": 640,
//           "started_at": 1591734585,
//           "live_id": 9891912,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin227.showroom-cdn.com/liveedge/fd38ccd955974973305c169bdab52667275027193e981c04f5008a7c4f47efc8_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/aaa8941e683df5752369530cb9368ad2d5d8d14206a9058528a7f2097510df4d_s.jpeg?v=1591722634",
//           "view_num": 154,
//           "genre_id": 102,
//           "main_name": "はくまいふぁーむ",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96f048:oBVl05SJ",
//           "room_id": 293815
//         }
//       ]
//     },
//     {
//       "genre_id": 103,
//       "banners": [],
//       "has_upcoming": true,
//       "genre_name": "才藝模特兒",
//       "lives": [
//         {
//           "desc": "每天直播15分鐘(900秒)以上的場地 *Non-stop broadcasting starts/ends at 3 am everyday. If the show started between 0:00:00 -02.59:00, it will be counted as the previous day's show.",
//           "name": "Say 'Hi!' to me every day!",
//           "cell_type": 0
//         },
//         {
//           "room_url_key": "a-light100",
//           "official_lv": 1,
//           "sub_name": "114 days in a row",
//           "telop": "Popteenオーディション決勝！！",
//           "color": "#00a73c",
//           "follower_num": 710,
//           "started_at": 1591732802,
//           "live_id": 9891848,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin207.showroom-cdn.com/liveedge/0d2c46e5c15211d6d8ab521a6de68f1a8a94761e2bc640a20b182735dc556485_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/54ad2e89d7411391508811e3abe638996fd536af95dd2ba4e7aa0f064f4b32cf_s.jpeg?v=1591701141",
//           "view_num": 653,
//           "genre_id": 103,
//           "main_name": "【アバター配布ガチイベ決勝！！】るーりるroom",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96f008:5lLwQQqf",
//           "room_id": 287985
//         },
//         {
//           "room_url_key": "292372",
//           "official_lv": 1,
//           "sub_name": "46 days in a row",
//           "telop": "♡7:00すぎまで♡次枠明日7:00〜",
//           "color": "#ffe100",
//           "follower_num": 598,
//           "started_at": 1591732818,
//           "live_id": 9891863,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin231.showroom-cdn.com/liveedge/8f18bc69523fb07b165b970fd287b54a55f54655be4185c6b38f026b6dbb44d4_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/e15bfc162dde4d8eb0a1681268db92406f337819ec9b72288baa2b9b384684e5_s.jpeg?v=1591461117",
//           "view_num": 680,
//           "genre_id": 103,
//           "main_name": "ななみるく◢⁴⁶",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96f017:ZOWDaGIw",
//           "room_id": 301199
//         }
//       ]
//     },
//     {
//       "genre_id": 101,
//       "banners": [],
//       "has_upcoming": true,
//       "genre_name": "音樂",
//       "lives": [
//         {
//           "desc": "每天直播15分鐘(900秒)以上的場地 *Non-stop broadcasting starts/ends at 3 am everyday. If the show started between 0:00:00 -02.59:00, it will be counted as the previous day's show.",
//           "name": "Say 'Hi!' to me every day!",
//           "cell_type": 0
//         },
//         {
//           "room_url_key": "nodoglaw",
//           "official_lv": 1,
//           "sub_name": "488 days in a row",
//           "telop": "本日もお疲れ様でした！",
//           "color": "#ebcd00",
//           "follower_num": 512,
//           "started_at": 1591734818,
//           "live_id": 9891932,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin232.showroom-cdn.com/liveedge/c71ab0de984c47b7c483d581cdc2b426038dd699eddb0e9bf7c970d4de862ebd_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/1355cb3e3bd14ce881063a48cfa0921535467dcc8a0b79a9e7f900f3a71bc220_s.jpeg?v=1591542007",
//           "view_num": 24,
//           "genre_id": 101,
//           "main_name": "低い声、好きですか？【喉黒一】",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96f05c:27aG6BKw",
//           "room_id": 223927
//         },
//         {
//           "room_url_key": "0ea273575055",
//           "official_lv": 1,
//           "sub_name": "102 days in a row",
//           "color": "#00a73c",
//           "follower_num": 331,
//           "started_at": 1591734705,
//           "live_id": 9891929,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin218.showroom-cdn.com/liveedge/0df08c44a350e62ecd05bdfc45d5289d1bdd41678700c56fe693a5cc2f61114b_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/9e8afeba3e7db442c4042653b06aaf85daa942c5b4da5fc5654f90fb5192cbdf_s.png?v=1591665752",
//           "view_num": 41,
//           "genre_id": 101,
//           "main_name": "【アバイべ中！】☪︎ぱんな家のまったりTime☪︎",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96f059:B2tyHz8a",
//           "room_id": 277645
//         }
//       ]
//     },
//     {
//       "genre_id": 104,
//       "banners": [],
//       "has_upcoming": true,
//       "genre_name": "聲優與動畫",
//       "lives": [
//         {
//           "desc": "每天直播15分鐘(900秒)以上的場地 *Non-stop broadcasting starts/ends at 3 am everyday. If the show started between 0:00:00 -02.59:00, it will be counted as the previous day's show.",
//           "name": "Say 'Hi!' to me every day!",
//           "cell_type": 0
//         },
//         {
//           "room_url_key": "926cd2270753",
//           "official_lv": 1,
//           "sub_name": "56 days in a row",
//           "telop": "娘が起きるまで配信♪次枠10時半〜",
//           "color": "#aace36",
//           "follower_num": 750,
//           "started_at": 1591733710,
//           "live_id": 9891895,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin274.showroom-cdn.com/liveedge/72900ae99759bb65d7a60220621975161f339cf14b2ff01452c5c3c285946040_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/a10f417fbccb6c21e93a17bc1e51c385f1c4dc00893500dcf301a9114d39222e_s.jpeg?v=1591733849",
//           "view_num": 130,
//           "genre_id": 104,
//           "main_name": "【団結力イベ！】でもほんとは…〇〇を語る。",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96f037:7mVFrfHR",
//           "room_id": 176737
//         },
//         {
//           "room_url_key": "vl5_a_40",
//           "official_lv": 1,
//           "sub_name": "20 days in a row",
//           "telop": "星へのお礼決め",
//           "color": "#ffe100",
//           "follower_num": 60,
//           "started_at": 1591729313,
//           "live_id": 9891806,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin214.showroom-cdn.com/liveedge/3d50a756d789f11a7fa1fbf6204bbe6fdf63cb3fc65857900fabff32367e239a_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/4f321110f4598fa65afe023aab5c3c43d97fcf2bec1860c7c82f97c6ecb56010_s.png?v=1591731729",
//           "view_num": 546,
//           "genre_id": 104,
//           "main_name": "【イベ中】なおくんのフリールーム(ヤオヨロズボイスラボ)",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96efde:FSyLjWmM",
//           "room_id": 295732
//         }
//       ]
//     },
//     {
//       "genre_id": 105,
//       "banners": [],
//       "has_upcoming": true,
//       "genre_name": "諧星/脫口秀",
//       "lives": [
//         {
//           "desc": "每天直播15分鐘(900秒)以上的場地 *Non-stop broadcasting starts/ends at 3 am everyday. If the show started between 0:00:00 -02.59:00, it will be counted as the previous day's show.",
//           "name": "Say 'Hi!' to me every day!",
//           "cell_type": 0
//         },
//         {
//           "room_url_key": "rg_ruki_jinguji",
//           "official_lv": 1,
//           "sub_name": "21 days in a row",
//           "telop": "まったり(*´ー｀*)",
//           "color": "#ffe100",
//           "follower_num": 165,
//           "started_at": 1591728630,
//           "live_id": 9891792,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin209.showroom-cdn.com/liveedge/680178db21266d7aa5e2dd82c1ad504855117e502ebeca1935dcf1c2b319d1a9_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/a3f7cc0624db1c2225ede550939b2cb15caff42365180c105cbaea95f6eaa639_s.jpeg?v=1591455359",
//           "view_num": 491,
//           "genre_id": 105,
//           "main_name": "神宮寺瑠姫（RAINGROUP：ROMEO＆JURIET）",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96efd0:GvnrSjmY",
//           "room_id": 285690
//         },
//         {
//           "room_url_key": "335e63034984",
//           "official_lv": 1,
//           "sub_name": "131 days in a row",
//           "telop": "星投げ、カウントよろしくお願い申し上げます。",
//           "color": "#00a73c",
//           "follower_num": 476,
//           "started_at": 1591733336,
//           "live_id": 9891883,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin278.showroom-cdn.com/liveedge/0d2b5b25654e1a8f0c11f61942c2b05a8bba69aff269e760e46d6162e9d85ec8_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/a1e22eac80bf45e1220b62df4e1a2d6de22786e5b2355e80f9d333001a1c6f41_s.jpeg?v=1591633312",
//           "view_num": 137,
//           "genre_id": 105,
//           "main_name": "ゆんちゃむ＆ぴちちゃむの飯テロR∞M",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96f02b:hMIJedZe",
//           "room_id": 271012
//         }
//       ]
//     },
//     {
//       "genre_id": 107,
//       "banners": [],
//       "has_upcoming": true,
//       "genre_name": "Virtual",
//       "lives": [
//         {
//           "desc": "每天直播15分鐘(900秒)以上的場地 *Non-stop broadcasting starts/ends at 3 am everyday. If the show started between 0:00:00 -02.59:00, it will be counted as the previous day's show.",
//           "name": "Say 'Hi!' to me every day!",
//           "cell_type": 0
//         },
//         {
//           "room_url_key": "68e173518205",
//           "official_lv": 1,
//           "sub_name": "41 days in a row",
//           "color": "#ffe100",
//           "follower_num": 365,
//           "started_at": 1591733486,
//           "live_id": 9891891,
//           "is_follow": false,
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin219.showroom-cdn.com/liveedge/490f31e5098f24ccefbebc61c2e512449f793f0d7c36da564d7728c6e844249a_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/c8acc2895e0cba09e00049b1d5af8fed9fda2723a8dac9c9f598dcc24de43745_s.png?v=1591714841",
//           "view_num": 273,
//           "genre_id": 107,
//           "main_name": "【初ガチイベ！】はむきゃすと！【1位狙っています！】",
//           "premium_room_type": 0,
//           "cell_type": 102,
//           "bcsvr_key": "96f033:pcNimbjg",
//           "room_id": 274839
//         },
//         {
//           "name": "實況",
//           "cell_type": 0
//         }
//       ]
//     },
//     {
//       "genre_id": 200,
//       "banners": [],
//       "has_upcoming": true,
//       "genre_name": "非專業人士",
//       "lives": [
//         {
//           "name": "第一次實況(即將開始的場地)",
//           "cell_type": 0
//         },
//         {
//           "room_url_key": "ed00e2046912",
//           "official_lv": 0,
//           "telop": "6/10　時の記念日",
//           "follower_num": 17,
//           "started_at": 1591732008,
//           "live_id": 9891839,
//           "is_follow": false,
//           "corner_image_file": "1_ja.png",
//           "streaming_url_list": [
//             {
//               "is_default": true,
//               "url": "https://hls-origin273.showroom-cdn.com/liveedge/9948172c2de3ac79d0644727dd93289e4d0136115a4d2a6a5a2c249aa004564c_low/chunklist.m3u8",
//               "label": "low spec",
//               "id": 4,
//               "type": "hls",
//               "quality": 150
//             }
//           ],
//           "live_type": 0,
//           "tags": [],
//           "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/6126862852d65f240f80468d4f055ca9d441494cbc43d876f4de6fc93cf820ff_s.png?v=1589429090",
//           "view_num": 283,
//           "genre_id": 200,
//           "main_name": "兎の雑談部屋～RABBIT HOUSE～ごゆるりと語ろう",
//           "premium_room_type": 0,
//           "cell_type": 100,
//           "bcsvr_key": "96efff:vipbT2aW",
//           "room_id": 224281
//         },
//         {
//           "name": "實況",
//           "cell_type": 0
//         }
//       ]
//     }
//   ],
//   "bcsvr_port": 8080,
//   "bcsvr_host": "online.showroom-live.com"
// }

// {
//   "room_url_key": "a-light100",
//   "official_lv": 1,
//   "telop": "Popteenオーディション決勝！！",
//   "follower_num": 710,
//   "started_at": 1591732802,
//   "live_id": 9891848,
//   "is_follow": false,
//   "streaming_url_list": [
//     {
//       "is_default": true,
//       "url": "https://hls-origin207.showroom-cdn.com/liveedge/0d2c46e5c15211d6d8ab521a6de68f1a8a94761e2bc640a20b182735dc556485_low/chunklist.m3u8",
//       "label": "low spec",
//       "id": 4,
//       "type": "hls",
//       "quality": 150
//     }
//   ],
//   "live_type": 0,
//   "tags": [],
//   "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/54ad2e89d7411391508811e3abe638996fd536af95dd2ba4e7aa0f064f4b32cf_s.jpeg?v=1591701141",
//   "view_num": 653,
//   "genre_id": 103,
//   "main_name": "【アバター配布ガチイベ決勝！！】るーりるroom",
//   "premium_room_type": 0,
//   "cell_type": 100,
//   "bcsvr_key": "96f008:5lLwQQqf",
//   "room_id": 287985
// }

// {
//   "name": "實況",
//   "cell_type": 0
// }

// {
//   "desc": "一定の条件を満たした男性配信者のルームが表示されます。 \nまた、表示されているルームのうち連続配信日数の上位ルームは、上部に表示されます。",
//   "name": "MEN'S",
//   "cell_type": 0
// },


// {
//   "cell_type": 7,
//   "message": "目前沒有任何場地正在舉辦實況表演。"
// }
