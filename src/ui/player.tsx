import * as React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { subscribe, client } from '../modules/showroom-live-stream/client'
import { times, call } from '../utils/js'
import { useBoxedValue } from '../utils/react-hooks'
import { MSE } from '../modules/showroom-live-stream/mse'

export const Player = React.memo((props: {
  roomId: number
}) => {
  // const { roomId } = props

  // const channelName = React.useMemo(() => uuidv4(), [roomId])

  // React.useEffect(() => subscribe(channelName, roomId, data => {
  //   console.log(data)
  // }), [channelName, roomId])

  return (
    <StreamPlayer />
  )
})

Player.displayName = 'Player'

const StreamPlayer = React.memo(() => {
  const chunksPath = `/Users/aihornmac/Library/Application Support/Electron/showroom-desktop/live-cache/248680/9892296/chunks`
  const mse = React.useMemo(() => new MSE(), [])
  const filePathList = React.useMemo(() => times(20, i => `file://${chunksPath}/${350 + i}.ts`), [])
  const [fileIndex, setFileIndex] = React.useState(0)
  const fileIndexRef = useBoxedValue(fileIndex)
  const videoRef = useBoxedValue(React.createRef<HTMLVideoElement>())

  React.useEffect(() => {
    call(async () => {
      for (let id = 350; id < 370; id++) {
        const uint8buffer = await client.async('getChunk')(248680, 9892296, id)
        console.log({ uint8buffer })
        mse.add(uint8buffer)
      }
      // videoRef.current.current!.play()
    })
  }, [])

  return (
    <video
      ref={videoRef.current}
      src={mse.url}
      width={640}
      height={360}
    />
  )
})

StreamPlayer.displayName = 'StreamPlayer'

// (() => {
//   const native = MediaSource.prototype.addSourceBuffer
//   MediaSource.prototype.addSourceBuffer = new Proxy(native, {
//     apply(...args) {
//       console.log(...args)
//       return Reflect.apply(...args)
//     }
//   })
// })()
