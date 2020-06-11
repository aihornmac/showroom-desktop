import * as path from 'path'
import { URL, format } from 'url'
import { EventEmitter } from 'events'
import * as chalk from 'chalk'
import { getLiveStreamingUrl } from '../showroom-api/live-streaming-url'
import { getLiveInfo } from '../showroom-api/live-info'
import { getLiveCachePath } from '../app'
import { fail } from '../error/error'
import { HLS, HLSLog, HLSError } from './hls'
import { later, once, call } from '../../utils/js'
import { TypedEventEmitter } from '../../utils/types'
import { Disposers } from '../../utils/disposers'

export type Event = {
  readonly kind: 'not started'
  readonly timestamp: number
} | {
  readonly kind: 'no hls found'
  readonly timestamp: number
} | {
  readonly kind: 'failed to get streaming url'
  readonly message: unknown
  readonly timestamp: number
} | {
  readonly kind: 'failed to get live info'
  readonly message: unknown
  readonly timestamp: number
} | {
  readonly kind: 'hls'
  readonly data: HLSLog | HLSError
  readonly timestamp: number
}

export class RoomCurrentLiveRecorder {
  private _hls?: HLS
  private _isDestroyed: boolean
  private _events = new EventEmitter() as TypedEventEmitter<{
    event(event: Event): void
  }>
  private _liveId?: number
  private _disposers: Disposers

  constructor(readonly roomId: number) {
    this._isDestroyed = false
    this._disposers = new Disposers()
    this._loop()
  }

  get liveId() {
    return this._liveId
  }

  destroy() {
    if (this._isDestroyed) return
    this._isDestroyed = true
    this._disposers.clear()
    this._hls?.stop()
  }

  subscribe(cb: (event: Event) => void) {
    const events = this._events
    events.on('event', cb)
    return once(() => { events.off('event', cb) })
  }

  async _loop() {
    const { roomId } = this
    const disposers = this._disposers

    let streamingUrl: string
    while (true) {
      try {
        if (this._isDestroyed) return

        const t0 = Date.now()

        // get streaming url
        const json = await getLiveStreamingUrl({}, { roomId })
        if (this._isDestroyed) return

        const list = json.streaming_url_list
        if (!list) {
          this._emit({
            kind: 'not started',
            timestamp: Date.now(),
          })
          const dt = Date.now() - t0
          await later(Math.max(0, 2000 - dt))
          if (this._isDestroyed) return
          continue
        }

        // only takes http live streaming
        const hlsList = list.filter(x => x.type.includes('hls'))
        if (!hlsList.length) {
          this._emit({
            kind: 'no hls found',
            timestamp: Date.now(),
          })
          await later(1000)
          continue
        }


        // pick hls stream
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
        if (this._isDestroyed) return
        this._emit({
          kind: 'failed to get streaming url',
          message: String(e),
          timestamp: Date.now(),
        })
        continue
      }
      break
    }

    console.log({ streamingUrl })

    console.log(`stream playlist ${streamingUrl}`)

    // get cache path by live info,
    // but we don't need to wait for this info to start recording,
    // so here it's in promise form
    const cachePath = call(async () => {
      while (true) {
        try {
          const info = await getLiveInfo({}, { roomId })
          const liveId = info.live_id
          if (!liveId) continue
          this._liveId = liveId
          console.log(`room id ${roomId}`)
          console.log(`live id ${liveId}`)
          return getRoomLiveCachePath(roomId, liveId)
        } catch (e) {
          this._emit({
            kind: 'failed to get live info',
            message: String(e),
            timestamp: Date.now(),
          })
          continue
        }
      }
    })

    const hls = this._hls = new HLS(streamingUrl, cachePath, {
      getHeuristicChunkUrl,
    })

    hls.start()

    disposers.add('log', hls.subscribe('log', data => {
      this._emit({
        kind: 'hls',
        data,
        timestamp: Date.now(),
      })
      if (data.kind === 'start downloading chunk') {
        if (data.confident) {
          console.log(chalk.gray(`downloading chunk [${data.id}] ${data.url}`))
        }
      } else if (data.kind === 'finish downloading chunk') {
        if (data.confident) {
          console.log(`downloaded chunk [${data.id}] ${data.url}`)
        } else {
          console.log(chalk.whiteBright(`heuristic downloaded chunk [${data.id}] ${data.url}`))
        }
      } else if (data.kind === 'request play list slow') {
        console.log(chalk.gray(`request play list timeout ${data.duration}`))
      } else if (data.kind === 'retry downloading chunk') {
        console.log(chalk.gray(`chunk ${data.id} download timeout ${data.duration}`))
      }
    }))

    disposers.add('error', hls.subscribe('error', data => {
      this._emit({
        kind: 'hls',
        data,
        timestamp: Date.now(),
      })
      if (data.kind === 'failed to download chunk') {
        if (data.confident) {
          console.error(chalk.redBright(`Failed to download chunk [${data.id}] ${data.url}`))
          console.log(data.error)
        }
      } else if (data.kind === 'failed to request playlist') {
      } else {
        const error = (data as { error?: unknown }).error
        console.error(error || data)
      }
    }))
  }

  private _emit(event: Event) {
    return this._events.emit('event', event)
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

export function getRoomLiveCachePath(roomId: number, liveId: number) {
  const dataPath = getLiveCachePath()
  return path.join(dataPath, String(roomId), String(liveId))
}
