import * as React from 'react'
import { client } from '../modules/showroom-live-stream/client'
import { useFetcherLike } from '../utils/react-hooks'
import { LivePlayer } from './live-player'
import { call, createExternalPromise } from '../utils/js'
import { niceToHave } from '../utils/flow-control'

export const RoomPlayer = React.memo((props: {
  roomId: number
}) => {
  const { roomId } = props

  const infoFetcher = useFetcherLike([roomId], async () => {
    const xp = createExternalPromise<number | undefined>()
    return Promise.race([
      xp.promise,
      niceToHave(async () => {
        const ret = await Promise.all([
          call(async () => {
            const liveId = await client.async('recordRoomCurrentLive')(roomId)
            if (liveId) xp.resolve(liveId)
            return liveId
          }),
          call(async () => {
            const info = await client.async('getLiveInfo')(roomId)
            const liveId = info.live_id
            if (liveId) xp.resolve(liveId)
            return liveId
          })
        ])
        return ret[0]
      }),
    ])
  })

  if (infoFetcher.state === 'loading') {
    return <>loading</>
  }

  if (infoFetcher.state === 'error') {
    return <>error {infoFetcher.error}</>
  }

  const liveId = infoFetcher.result
  if (!liveId) {
    return <>live is not started</>
  }

  return (
    <LivePlayer
      roomId={roomId}
      liveId={liveId}
      online={true}
    />
  )
})

RoomPlayer.displayName = 'RoomPlayer'
