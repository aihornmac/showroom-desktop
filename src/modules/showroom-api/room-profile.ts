import Axios from 'axios'
import { API_URL } from './common'
import { Client } from './client'

/**
 * get live information
 */
export async function getRoomProfile(
  _client: Client,
  options: GetRoomProfile.Options,
): Promise<GetRoomProfile.Response> {
  const url = `${API_URL}/room/profile`
  const res = await Axios.get<GetRoomProfile.Response>(url, {
    responseType: 'json',
    params: {
      room_id: options.roomId,
    },
  })
  return res.data
}

export namespace GetRoomProfile {
  export interface Options {
    roomId: number
  }

  export interface Response extends Response.RootObject {}

  export namespace Response {

    export interface ImageList {
      m_original: string
      ts: number
      id: number
      m: string
    }

    export interface BannerList {
      url: string
      image: string
    }

    export interface PushSendStatus {
    }

    export interface VoiceList {
      m_original: null | string
      ts: number
      id: number
      m: string
    }

    export interface Label {
      color: string
      text: string
    }

    export interface Event {
      ended_at: number
      started_at: number
      url: string
      name: string
      label: Label
      image: string
    }

    export interface User {
      name: string
      image: string
    }

    export interface RecommendCommentList {
      created_at: number
      comment: string
      user: User
    }

    export interface SnsList {
      icon: string
      url: string
    }

    export interface Avatar {
      description: string
      list: string[]
    }

    export interface RootObject {
      image_list: ImageList[]
      banner_list: BannerList[]
      is_talk_online: boolean
      award_list: null | unknown[]
      push_send_status: PushSendStatus
      performer_name: null | string
      follower_num: number
      live_id: number
      is_official: boolean
      is_follow: boolean
      voice_list: VoiceList[]
      event: Event
      is_birthday: boolean
      description: string
      genre_id: number
      youtube_id: string
      visit_count: number
      recommend_comment_list: RecommendCommentList[]
      current_live_started_at: number
      share_text_live: string
      sns_list: SnsList[]
      recommend_comments_url: string
      share_url: string
      room_url_key: string
      league_label: string
      avatar: Avatar
      share_url_live: string
      is_talk_opened: boolean
      recommend_comment_post_url: string
      genre_name: string
      room_name: string
      // seconds, timestamp = birthday * 1000 + 29 years
      birthday: number
      room_level: number
      image: string
      recommend_comment_open_status: number
      main_name: string
      view_num: number
      has_more_recommend_comment: boolean
      premium_room_type: number
      is_onlive: boolean
      room_id: number
    }

  }
}

// https://www.showroom-live.com/api/room/profile?room_id=267158

// {
//   "image_list": [
//     {
//       "m_original": "https://showroom.cdn-dena.com/resize/large/image/fan_talk/830ebf8f7b536ecea2080032d089beddc3e04216d7f17f92d1e02dc415e6f869.jpeg?v=1",
//       "ts": 1591409534,
//       "id": 57724262,
//       "m": "https://showroom.cdn-dena.com/resize/small/image/fan_talk/830ebf8f7b536ecea2080032d089beddc3e04216d7f17f92d1e02dc415e6f869.jpeg?v=1"
//     },
//     {
//       "m_original": "https://showroom.cdn-dena.com/resize/large/image/fan_talk/4438cf54e2fb83098f69d5170974e177a7c0c0dae24c1bce1aa908020d6422fc.jpeg?v=1",
//       "ts": 1591291593,
//       "id": 57694173,
//       "m": "https://showroom.cdn-dena.com/resize/small/image/fan_talk/4438cf54e2fb83098f69d5170974e177a7c0c0dae24c1bce1aa908020d6422fc.jpeg?v=1"
//     },
//     {
//       "m_original": "https://showroom.cdn-dena.com/resize/large/image/fan_talk/df7832d329e0731125cf877528c999a4af4134cb217f6a6cc383b3d1d245c4e3.jpeg?v=1",
//       "ts": 1591168271,
//       "id": 57655946,
//       "m": "https://showroom.cdn-dena.com/resize/small/image/fan_talk/df7832d329e0731125cf877528c999a4af4134cb217f6a6cc383b3d1d245c4e3.jpeg?v=1"
//     },
//     {
//       "m_original": "https://showroom.cdn-dena.com/resize/large/image/fan_talk/f64aecec03deced56343246f62862d61d624b8d482e7c0d24d023c5e29602a78.jpeg?v=1",
//       "ts": 1568557922,
//       "id": 50345187,
//       "m": "https://showroom.cdn-dena.com/resize/small/image/fan_talk/f64aecec03deced56343246f62862d61d624b8d482e7c0d24d023c5e29602a78.jpeg?v=1"
//     },
//     {
//       "m_original": "https://showroom.cdn-dena.com/resize/large/image/fan_talk/b16ea44613721609d66a134fab2cc2f3fee522834782484e04a9b5ec57c871bf.jpeg?v=1",
//       "ts": 1567029476,
//       "id": 49845850,
//       "m": "https://showroom.cdn-dena.com/resize/small/image/fan_talk/b16ea44613721609d66a134fab2cc2f3fee522834782484e04a9b5ec57c871bf.jpeg?v=1"
//     },
//     {
//       "m_original": "https://showroom.cdn-dena.com/resize/large/image/fan_talk/74e78042a484a378119d4f4682f8a80285c13477f2f0d2beff905b6731ce7e28.jpeg?v=1",
//       "ts": 1566914699,
//       "id": 49811910,
//       "m": "https://showroom.cdn-dena.com/resize/small/image/fan_talk/74e78042a484a378119d4f4682f8a80285c13477f2f0d2beff905b6731ce7e28.jpeg?v=1"
//     },
//     {
//       "m_original": "https://showroom.cdn-dena.com/resize/large/image/fan_talk/55bf1ed904528976eff27db8e092602d5fac738859cad8fd8977f4fe6ede800d.jpeg?v=1",
//       "ts": 1566811726,
//       "id": 49774916,
//       "m": "https://showroom.cdn-dena.com/resize/small/image/fan_talk/55bf1ed904528976eff27db8e092602d5fac738859cad8fd8977f4fe6ede800d.jpeg?v=1"
//     }
//   ],
//   "banner_list": [
//     {
//       "url": "https://www.instagram.com/moe_goto0520/?hl=ja",
//       "image": "https://image.showroom-live.com/showroom-prod/image/room/2958da55573617424b9bb2ab5d281ce74e3036a85f4d440a256f00c6e0c9010f/banner_1.jpeg?v=1591719431"
//     },
//     {
//       "url": "https://vt.tiktok.com/N8g5hT/",
//       "image": "https://image.showroom-live.com/showroom-prod/image/room/2958da55573617424b9bb2ab5d281ce74e3036a85f4d440a256f00c6e0c9010f/banner_2.jpeg?v=1591719431"
//     }
//   ],
//   "is_talk_online": false,
//   "award_list": null,
//   "push_send_status": {},
//   "performer_name": null,
//   "follower_num": 6848,
//   "live_id": 0,
//   "is_official": true,
//   "is_follow": false,
//   "voice_list": [
//     {
//       "m_original": null,
//       "ts": 1591462164,
//       "id": 57745163,
//       "m": "https://image.showroom-live.com/showroom-prod/image/fan_talk/a57e9a278283ccdb764eefd00cce7f4eab14ca778c4a4f1e0d2a83b9ad0eba37.aac?v=1"
//     },
//     {
//       "m_original": null,
//       "ts": 1585238523,
//       "id": 54898381,
//       "m": "https://image.showroom-live.com/showroom-prod/image/fan_talk/17bafd5da27641bac970279031a8b5c25619431f9f667681454bb5885a2dad23.aac?v=1"
//     },
//     {
//       "m_original": null,
//       "ts": 1585067461,
//       "id": 54852044,
//       "m": "https://image.showroom-live.com/showroom-prod/image/fan_talk/d06843daa9da894d63209942a00a9d93776df72423a9130745d3fed1cc05cc32.aac?v=1"
//     }
//   ],
//   "event": {
//     "ended_at": 1591801199,
//     "started_at": 1591542000,
//     "url": "https://www.showroom-live.com/event/_unity_showroom_5",
//     "name": "【まったり3日間♪】リスナーさんと団結力を深めよう！vol.5",
//     "label": {
//       "color": "#FF0000",
//       "text": "あと20時間"
//     },
//     "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/bf6009779fb25a9a74fcad2fedd5cb1fc9db9335beba4565d1da0bcd807f32c1_s.png?v=1590722394"
//   },
//   "is_birthday": false,
//   "description": "もえきゅんこと、後藤萌咲です！\r\n歌うこと話すこと大好きな多趣味です☺︎\r\nたくさん楽しいお話しましょ~！✨\r\n\r\nお気軽にコメントも待ってます~⭐️\r\n\r\n\r\n皆さまのおかげで、\r\nSHOWROOM 第3期 トップランカーに、\r\n選んで頂きました…！\r\n\r\nいつも暖かい応援ありがとうございます！\r\n\r\n\r\n\r\n❤︎Instagram❤︎Twitter❤︎TikTok\r\n@moe_goto0520\r\n\r\nFollow Me！！\r\n",
//   "genre_id": 101,
//   "youtube_id": "9NfNqOqYu7g",
//   "visit_count": 0,
//   "recommend_comment_list": [
//     {
//       "created_at": 1566367505,
//       "comment": "やっぱりもえきゅんが好きになった(//∇//)\nよろしくお願いします。\n",
//       "user": {
//         "name": "ビリケンhiro@もえきゅん1位おめでとう！",
//         "image": "https://image.showroom-live.com/showroom-prod/image/avatar/1027247.png?v=81"
//       }
//     },
//     {
//       "created_at": 1577499482,
//       "comment": "後藤萌咲を、一生神推しします♪♪\nカワイイし、キレイだし、大好きです♪♪\nSHOW ROOMで大輪の花を咲かせて下さい♪\n2020.1.31サファイアブルーでの歌手デビューおめでとう♪\nGO  GO  LET'S GO ！♪",
//       "user": {
//         "name": "G.G.TAKA♒️@萌咲 大好き❣️Gぃ～Gぃ～",
//         "image": "https://image.showroom-live.com/showroom-prod/image/avatar/1026975.png?v=81"
//       }
//     },
//     {
//       "created_at": 1591099368,
//       "comment": "後藤萌咲さんこんばんは。\n体調いかがですか？私は、元気です。後藤萌咲さんも、お体にお気をつけて、過ごしてくださいね。応援しています。",
//       "user": {
//         "name": "めっぽん",
//         "image": "https://image.showroom-live.com/showroom-prod/image/avatar/28.png?v=81"
//       }
//     }
//   ],
//   "current_live_started_at": 0,
//   "share_text_live": "後藤萌咲【新アバ配布中！】まったりイベント中！！ 現正廣播中！！\nhttps://www.showroom-live.com/04e793461162",
//   "sns_list": [
//     {
//       "icon": "https://image.showroom-live.com/showroom-prod/assets/img/icon/sns/twitter.png",
//       "url": "https://www.showroom-live.com/social/twitter/redirect_to_twitter?room_id=267158&user_id=3461162"
//     },
//     {
//       "icon": "https://image.showroom-live.com/showroom-prod/assets/img/icon/sns/youtube.png",
//       "url": "https://www.youtube.com/watch?v=9NfNqOqYu7g"
//     }
//   ],
//   "recommend_comments_url": "https://www.showroom-live.com/room/recommend_comments?room_id=267158",
//   "share_url": "https://www.showroom-live.com/room/profile?room_id=267158",
//   "room_url_key": "04e793461162",
//   "league_label": "S(Top Ranker)",
//   "avatar": {
//     "description": "送禮物給這位表演者，您將可獲得原創虛擬形象！",
//     "list": [
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1027247.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1026591.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1026409.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1026236.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1025820.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1024125.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1024123.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1023892.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1023529.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1022981.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1022835.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1022129.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1021926.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1020786.png?v=81",
//       "https://image.showroom-live.com/showroom-prod/image/avatar/1020148.png?v=81"
//     ]
//   },
//   "share_url_live": "https://www.showroom-live.com/04e793461162",
//   "is_talk_opened": true,
//   "recommend_comment_post_url": "https://www.showroom-live.com/room/recommend_comments?room_id=267158#post",
//   "genre_name": "音樂",
//   "room_name": "後藤萌咲【新アバ配布中！】まったりイベント中！！",
//   "birthday": 75135600,
//   "room_level": 1169,
//   "image": "https://image.showroom-live.com/showroom-prod/image/room/cover/2958da55573617424b9bb2ab5d281ce74e3036a85f4d440a256f00c6e0c9010f_m.jpeg?v=1591719431",
//   "recommend_comment_open_status": 1,
//   "main_name": "後藤萌咲【新アバ配布中！】まったりイベント中！！",
//   "view_num": 0,
//   "has_more_recommend_comment": true,
//   "premium_room_type": 0,
//   "is_onlive": false,
//   "room_id": 267158
// }
