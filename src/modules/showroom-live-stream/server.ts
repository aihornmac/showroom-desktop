import * as path from 'path'
import * as fs from 'fs'
import { URL, format } from 'url'
import { IPCServer } from '../../utils/ipc/server'
import { HLS, HLSLog, HLSError } from './hls'
import { IpcMainEvent } from 'electron'
import { client } from '../showroom-api/client'
import { getLiveInfo } from '../showroom-api/live-info'
import { getLiveCachePath } from '../app'
import { getLiveStreamingUrl } from '../showroom-api/live-streaming-url'
import { later, call } from '../../utils/js'
import { Disposers } from '../../utils/disposers'
import { fail } from '../error/error'

class API {
  readonly hlsMap = new Map<string, HLS>()
  readonly disposersMap = new Map<string, Disposers>()

  getLiveInfo() {
    return (roomId: number) => getLiveInfo(client, { roomId })
  }

  getTestChunk() {
    return async () => {
      const chunkPath = `/Users/aihornmac/Library/Application Support/Electron/showroom-desktop/live-cache/248680/350.mp4`
      const buf = await fs.promises.readFile(chunkPath)
      return new Uint8Array(buf.buffer)
    }
  }

  getChunk() {
    return async (roomId: number, liveId: number, chunkId: number) => {
      const chunkPath = path.join(getCachePath(roomId, liveId), 'chunks', `${chunkId}.ts`)
      const buf = await fs.promises.readFile(chunkPath)
      return new Uint8Array(buf.buffer)
    }
  }

  subscribe(event: IpcMainEvent) {
    const { sender } = event

    return async (channelName: string, roomId: number) => {
      const isDestroyed = () => sender.isDestroyed()

      let streamingUrl: string
      while (true) {
        try {
          if (isDestroyed()) return

          const t0 = Date.now()
          const json = await getLiveStreamingUrl(client, { roomId })

          if (isDestroyed()) return

          const list = json.streaming_url_list
          if (!list) {
            const dt = Date.now() - t0
            await later(Math.max(0, 2000 - dt))
            if (isDestroyed()) return
            sender.send(channelName, createMessage({
              kind: 'not started',
            }))
            continue
          }

          // only takes http live streaming
          const hlsList = list.filter(x => x.type.includes('hls'))
          if (!hlsList.length) {
            sender.send(channelName, createMessage({
              kind: 'error',
              message: 'no hls found',
            }))
            await later(1000)
            continue
          }

          const hls = (
            hlsList.find(x => x.is_default) ||
            hlsList.slice()
              .filter(x => typeof x.quality === 'number')
              .sort((a, b) => b.quality - a.quality)[0] ||
            hlsList[0]
          )

          streamingUrl = hls.url
        } catch (e) {
          console.error(e)
          if (isDestroyed()) return
          sender.send(channelName, createMessage({
            kind: 'error',
            message: String(e),
          }))
          continue
        }
        break
      }

      console.log({ streamingUrl })

      console.log(`stream playlist ${streamingUrl}`)

      let hls = this.hlsMap.get(streamingUrl)
      if (!hls) {
        const cachePath = call(async () => {
          while (true) {
            try {
              const info = await getLiveInfo(client, { roomId })
              const liveId = info.live_id
              if (!liveId) continue
              return getCachePath(roomId, liveId)
            } catch (e) {
              sender.send(channelName, createMessage({
                kind: 'error',
                message: String(e),
              }))
              continue
            }
          }
        })

        hls = new HLS(streamingUrl, cachePath, {
          getHeuristicChunkUrl,
        })

        this.hlsMap.set(streamingUrl, hls)

        hls.start()
      }

      const disposers = new Disposers()
      this.disposersMap.set(channelName, disposers)

      disposers.add('log', hls.subscribe('log', data => {
        console.log(data)
        sender.send(channelName, createMessage({
          kind: 'hls log',
          data,
        }))
      }))

      disposers.add('error', hls.subscribe('error', data => {
        const error = (data as { error?: unknown }).error
        console.error({
          ...data,
          error: String(error),
        })
        console.error(error)
        sender.send(channelName, createMessage({
          kind: 'hls error',
          data,
        }))
      }))
    }
  }

  unsubscribe() {
    return async (channelName: string) => {
      const map = this.disposersMap
      const disposers = map.get(channelName)
      if (!disposers) return
      disposers.clear()
    }
  }
}

function getHeuristicChunkUrl(sampleChunkId: number, sampleChunkUrl: string) {
  const u = new URL(sampleChunkUrl)
  const sampleChunkFileName = path.basename(u.pathname)
  u.pathname = path.dirname(u.pathname)
  const directory = format(u)
  return function getById(id: number) {
    if (id === sampleChunkId) return sampleChunkUrl
    const newFileName = sampleChunkFileName.replace(String(sampleChunkId), String(id))
    if (newFileName === sampleChunkFileName) {
      throw fail(`Failed to get heuristic chunk url of ${id} given chunk ${sampleChunkId} ${sampleChunkUrl}`)
    }
    const newUrl = new URL(directory)
    newUrl.pathname += `/${newFileName}`
    return format(newUrl)
  }
}

function getCachePath(roomId: number, liveId: number) {
  const dataPath = getLiveCachePath()
  return path.join(dataPath, String(roomId), String(liveId))
}

function createMessage<T extends MessagePayload>(data: T): T {
  return data
}

export type MessagePayload = {
  kind: 'not started'
} | {
  kind: 'error'
  message: string
} | {
  kind: 'hls log'
  data: HLSLog
} | {
  kind: 'hls error'
  data: HLSError
}

export type { API }

export const server = new IPCServer<API, {}>({
  api: new API(),
  channelName: `showroom-live-stream`,
})
