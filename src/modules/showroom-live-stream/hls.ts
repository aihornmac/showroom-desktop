import * as fs from 'fs'
import * as path from 'path'
import * as URL from 'url'
import Axios, { AxiosResponse } from 'axios'
import { EventEmitter as NodeEventEmitter } from 'events'
import type { TypedEventEmitter, MaybePromise } from '../../utils/types'
import { later, call, times } from '../../utils/js'
import { parseM3U } from '../../utils/m3u'
import { runSafely, SafeResult, useBinaryExponentialBackoffAlgorithm } from '../../utils/flow-control'
import { PlayListFile } from './types'

export type HLSEventMap = {
  log(data: HLSLog): void
  error(data: HLSError): void
}

export type HLSLog = {
  readonly kind: 'request play list slow'
  readonly duration:  number
} | {
  readonly kind: 'play list not found'
} | {
  readonly kind: 'start downloading chunk'
  readonly id: number
  readonly url: string
  readonly confident: boolean
} | {
  readonly kind: 'finish downloading chunk'
  readonly id: number
  readonly url: string
  readonly confident: boolean
} | {
  readonly kind: 'retry downloading chunk'
  readonly id: number
  readonly url: string
  readonly confident: boolean
  readonly retries: number
}

export type HLSError = {
  readonly kind: 'failed to init'
  readonly error: unknown
} | {
  readonly kind: 'failed to parse m3u'
  readonly error: unknown
} | {
  readonly kind: 'failed to write playlist'
  readonly error: unknown
} | {
  readonly kind: 'failed to call heuristic chunk probing'
  readonly error: unknown
} | {
  readonly kind: 'failed to request playlist'
  readonly error: unknown
} | {
  readonly kind: 'failed to fetch chunk'
  readonly id: number
  readonly url: string
  readonly confident: boolean
  readonly status: number
} | {
  readonly kind: 'failed to download chunk'
  readonly id: number
  readonly url: string
  readonly confident: boolean
  readonly error: unknown
} | {
  readonly kind: 'failed to write chunk'
  readonly id: number
  readonly url: string
  readonly confident: boolean
  readonly error: unknown
} | {
  readonly kind: 'unknown'
  readonly error: unknown
}

export interface HLSOptions {
  readonly getHeuristicChunkUrl?: (id: number, url: string) => (id: number) => string
}

interface HLSEventEmitter extends Omit<NodeEventEmitter, keyof TypedEventEmitter<HLSEventMap>>, TypedEventEmitter<HLSEventMap> {}

interface HLSPath {
  readonly cachePath: string
  readonly playListsPath: string
  readonly chunksPath: string
}

export class HLS {
  private _url: string
  private _pathPromise: PromiseLike<HLSPath>
  private _options: HLSOptions
  private _loopPromise?: Promise<void>
  private _isDestroyed: boolean
  private _initState: 'none' | 'pending' | 'resolved' | 'rejected'
  private _initPromise?: Promise<'resolved' | 'rejected'>
  private _events: HLSEventEmitter
  private _getHeuristicChunkUrl?: (id: number) => string
  private _chunkFileNameMap: Map<number, string>
  private _chunkDownloadMap: Map<number, ChunkDownload>

  constructor(
    streamingUrl: string,
    cachePath: MaybePromise<string>,
    options: HLSOptions = {},
  ) {
    this._url = streamingUrl
    this._pathPromise = this._getPath(cachePath)
    this._options = options
    this._isDestroyed = false
    this._initState = 'none'
    this._events = new NodeEventEmitter() as HLSEventEmitter
    this._chunkFileNameMap = new Map()
    this._chunkDownloadMap = new Map()
  }

  get state() {
    if (this._isDestroyed) return 'destroyed'
    if (this._loopPromise) {
      const initState = this._initState
      if (initState === 'pending') return 'initializing'
      if (initState === 'rejected') return 'initialization failed'
      if (initState === 'resolved') return 'started'
      return 'starting'
    }
    return 'not started'
  }

  subscribe<K extends keyof HLSEventMap>(key: K, fn: HLSEventMap[K]): () => void {
    const events = this._events
    events.on(key, fn)
    return () => events.off(key, fn)
  }

  start() {
    return this._loopPromise || (this._loopPromise = this._loopPlayList())
  }

  stop() {
    if (this._isDestroyed) return
    this._isDestroyed = true
  }

  private async _getPath(inputCachePath: MaybePromise<string>): Promise<HLSPath> {
    const cachePath = await inputCachePath
    const playListsPath = path.join(cachePath, 'playlists')
    const chunksPath = path.join(cachePath, 'chunks')
    return { cachePath, playListsPath, chunksPath }
  }

  private _ensureInit() {
    return this._initPromise || (this._initPromise = this._init())
  }

  /**
   * execute initialization
   */
  private async _init() {
    try {
      this._initState = 'pending'
      const { cachePath, playListsPath, chunksPath } = await this._pathPromise
      await Promise.all([
        fs.promises.mkdir(cachePath, { recursive: true }),
        fs.promises.mkdir(playListsPath, { recursive: true }),
        fs.promises.mkdir(chunksPath, { recursive: true }),
      ])
      this._initState = 'resolved'
      return 'resolved'
    } catch (e) {
      this._initState = 'rejected'
      this._events.emit('error', {
        kind: 'failed to init',
        error: e,
      })
      this.stop()
      return 'rejected'
    }
  }

  /**
   * loop play list at certain interval
   */
  private async _loopPlayList() {
    const interval = 2000

    while (true) {
      if (this._isDestroyed) return

      const t0 = Date.now()

      const check = async () => {
        try {
          await this._requestPlayList()
          const dt = Date.now() - t0
          if (dt > interval * 2) {
            this._events.emit('log', {
              kind: 'request play list slow',
              duration: dt,
            })
          }
        } catch (e) {
          console.error(e)
        }
      }
      check()

      const t1 = Date.now()
      const dt = t1 - t0
      if (dt < interval) {
        await later(interval - dt)
      }
    }
  }

  private async _requestPlayList(): Promise<void> {
    const t0 = Date.now()

    // ensure playlist result
    let res: AxiosResponse<string>
    while (true) {
      if (this._isDestroyed) return

      try {
        res = await Axios.get<string>(this._url, {
          responseType: 'text',
          validateStatus(status) {
            return status >= 200 && status < 300 || status === 404
          },
        })
      } catch (e) {
        if (this._isDestroyed) return

        this._events.emit('error', {
          kind: 'failed to request playlist',
          error: e,
        })
        continue
      }

      if (this._isDestroyed) return

      if (res.status === 404) {
        this._events.emit('log', {
          kind: 'play list not found',
        })
        continue
      }

      break
    }

    if (this._isDestroyed) return

    const raw = res.data
    const m3u = call(() => {
      try {
        return parseM3U(raw)
      } catch (e) {
        this._events.emit('error', {
          kind: 'failed to parse m3u',
          error: e,
        })
        return
      }
    })
    call(async () => {
      try {
        if (await this._ensureInit() === 'rejected') return
        const { playListsPath } = await this._pathPromise
        const content: PlayListFile = { raw, parsed: m3u }
        const json = JSON.stringify(content, null, 2)
        await fs.promises.writeFile(path.join(playListsPath, `${t0}.json`), json)
      } catch (e) {
        this._events.emit('error', {
          kind: 'failed to write playlist',
          error: e,
        })
      }
    })
    if (m3u) {
      const { mediaSequence } = m3u.extension
      if (typeof mediaSequence === 'number') {
        // download chunks
        call(async () => {
          try {
            await Promise.all(m3u.tracks.map(async (track, i) => {
              const id = mediaSequence + i
              await this._downloadChunk(id, track.url, true)
            }))
          } catch (e) {
            this._events.emit('error', {
              kind: 'unknown',
              error: e,
            })
          }
        })
        // heuristic chunk probing
        call(() => {
          try {
            if (this._getHeuristicChunkUrl) {
              // try to trigger later forward probing
              this._triggerHeuristicChunkDownload({
                endId: mediaSequence,
                confident: true,
              })
            } else {
              // try to trigger first forward probing
              if (m3u.tracks.length) {
                const creator = this._options.getHeuristicChunkUrl
                if (creator) {
                  const chunkUrl = URL.resolve(this._url, m3u.tracks[0].url)
                  this._getHeuristicChunkUrl = creator(mediaSequence, chunkUrl)
                  this._triggerHeuristicChunkDownload({
                    startId: 0,
                    endId: mediaSequence,
                    confident: false,
                  })
                }
              }
            }
          } catch (e) {
            this._events.emit('error', {
              kind: 'failed to call heuristic chunk probing',
              error: e,
            })
          }
        })
      }
    }
  }

  private async _downloadChunk(id: number, url: string, confident: boolean) {
    if (this._isChunkExisted(id)) return
    const map = this._chunkDownloadMap
    const chunkUrl = URL.resolve(this._url, url)
    const download = new ChunkDownload(id, chunkUrl, this._pathPromise.then(x => x.chunksPath), confident, this._events)
    map.set(id, download)
    this._events.emit('log', {
      kind: 'start downloading chunk',
      id,
      url: chunkUrl,
      confident,
    })
    const ret = await download.result()
    if (ret.state === 'rejected') {
      this._events.emit('error', {
        kind: 'failed to download chunk',
        id,
        url: chunkUrl,
        confident,
        error: ret.error,
      })
    } else if (ret.result) {
      this._events.emit('log', {
        kind: 'finish downloading chunk',
        id,
        url: chunkUrl,
        confident,
      })
    }
    return ret
  }

  private async _triggerHeuristicChunkDownload(options: {
    readonly startId?: number
    readonly endId: number
    readonly confident: boolean
    readonly batchLength?: number
  }) {
    const getHeuristicChunkUrl = this._getHeuristicChunkUrl
    if (!getHeuristicChunkUrl) return
    const { endId, confident } = options
    const batchLength = options.batchLength || 100
    const startId = options.startId ?? Math.max(0, endId - batchLength)
    for (let rightId = endId; rightId > startId; rightId -= batchLength) {
      const leftId = Math.max(0, rightId - batchLength)
      const length = rightId - leftId
      if (length <= 0) return
      await Promise.all(times(length, async i => {
        const id = rightId - i
        if (this._isChunkExisted(id)) return
        const url = getHeuristicChunkUrl(id)
        return this._downloadChunk(id, url, confident)
      }))
    }
  }

  private _isChunkExisted(id: number) {
    return this._chunkFileNameMap.has(id) || this._chunkDownloadMap.has(id)
  }
}

// class SequenceChecker {
//   private _missing = new Set<number>()
//   private _max: number
//   private _missingRangeList: Array<{ start: number, end: number }> = []

//   constructor(private readonly _min: number) {
//     this._max = _min
//   }

//   getMissing(): Iterable<number> {
//     return this._missing
//   }

//   put(value: number) {
//     const max = this._max
//     if (value > max) {
//       this._max = value
//       const nextToMax = max + 1
//       if (value > nextToMax) {
//         // creates new holy range
//         this._missingRangeList.push({
//           start: nextToMax,
//           end: value - 1,
//         })
//       }
//     } else if (value < max) {
//       const list = this._missingRangeList
//       const { length } = list
//       for (let i = length - 1; i > -1; i++) {
//         const range = list[i]
//         const { end } = range
//         if (value > end) return
//       }
//     }
//   }
// }

class ChunkDownload {
  private _promise: Promise<SafeResult<boolean>>

  constructor(
    readonly id: number,
    readonly url: string,
    readonly chunksPath: PromiseLike<string>,
    readonly confident: boolean,
    private readonly _events: HLSEventEmitter,
  ) {
    this._promise = runSafely(() => this._run())
  }

  result() {
    return this._promise
  }

  private async _run() {
    const buffer = await useBinaryExponentialBackoffAlgorithm(async (duration, retries) => {
      if (duration > 4000) {
        this._events.emit('log', {
          kind: 'retry downloading chunk',
          id: this.id,
          url: this.url,
          confident: this.confident,
          retries,
        })
      }
      return this._fetchBuffer()
    }, {
      startInterval: 2000,
      maxRetry: 6,
    })
    if (buffer) {
      const ok = await call(async () => {
        try {
          const chunksPath = await this.chunksPath
          const { id, url } = this
          const ext = path.extname(url).slice(1)
          const filePath = path.join(chunksPath, `${id}${ext ? '.' + ext : ''}`)
          await fs.promises.writeFile(filePath, buffer)
          return true
        } catch (e) {
          this._events.emit('error', {
            kind: 'failed to write chunk',
            id: this.id,
            url: this.url,
            confident: this.confident,
            error: e,
          })
          return false
        }
      })
      if (ok) return true
    }
    return false
  }

  private async _fetchBuffer(): Promise<Buffer | undefined> {
    const { id, url } = this

    while (true) {
      const res = await Axios.get<Buffer>(url, {
        validateStatus(status) {
          return status >= 200 && status < 300 || status >= 400
        },
        responseType: 'arraybuffer',
      })
      if (res.status >= 200 && res.status < 300) {
        return res.data
      }
      // for heuristic download, if returns 404, no need to try again
      if (!this.confident && res.status === 404) return
      this._events.emit('error', {
        kind: 'failed to fetch chunk',
        id,
        url,
        confident: this.confident,
        status: res.status,
      })
    }
  }
}
