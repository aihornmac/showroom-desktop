import { MSE } from '../showroom-live-stream/mse'
import { FalseLike } from '../../utils/types'
import { ChunkMeta } from './types'
import { EventEmitter, EventEmitterListener } from '../../utils/event-emitter'
import { SortedArray } from '../../utils/sorted-array'
import { createExternalPromise, ExternalPromise, later, createSequancePromise } from '../../utils/js'
import { client } from './client'
import { TakeLastStream } from '../../utils/stream'
import { Disposers } from '../../utils/disposers'

export type LivePlayerEventMap = {
  ['update duration'](newValue: number, oldValue: number): void
  ['update partialStartTime'](newValue: number, oldValue: number): void
  ['update isPlaying'](playing: boolean): void
}

export class LivePlayer {
  private _video?: HTMLVideoElement
  private readonly _mse = new MSE()
  private readonly _chunksMetaMap: Map<number, ChunkMeta>
  private readonly _chunksMetaList: SortedArray<ChunkMeta>
  private _duration: number
  private readonly _events = new EventEmitter<LivePlayerEventMap>()
  private _seekId = 0
  private _seekTimepoint = 0
  // indicates start chunk.startedAt
  private _partStartTime = 0
  private _currentTime = 0
  private _isPlaying = false
  private _isDestroyed = false
  private _seekPromise?: ExternalPromise<void>
  private _playPausePromise = createSequancePromise()
  private _internalPlayPausePromise = createSequancePromise()
  private _startChunkId = 0
  private _removeBufferStream: TakeLastStream<number>
  private _disposers = new Disposers()

  constructor(
    private readonly _getVideoElement: () => HTMLVideoElement | FalseLike,
    readonly roomId: number,
    readonly liveId: number,
    initialChunksMeta?: Iterable<ChunkMeta>,
  ) {
    const chunksMetaList = this._chunksMetaList = new SortedArray(initialChunksMeta, (a, b) => a.id - b.id)
    this._chunksMetaMap = new Map(Array.from(initialChunksMeta || []).map(x => [x.id, x]))
    this._duration = !chunksMetaList.length ? 0 : (() => {
      const meta = chunksMetaList.get(chunksMetaList.length - 1)
      return meta.startedAt + meta.duration
    })()
    this._removeBufferStream = new TakeLastStream()
  }

  get url() {
    return this._mse.url
  }

  get duration() {
    return this._duration
  }

  get partStartTime() {
    return this._partStartTime
  }

  get validStartTimepoint() {
    const list = this._chunksMetaList
    if (!list.length) return 0
    return list.get(0).startedAt
  }

  get validEndTimepoint() {
    const list = this._chunksMetaList
    const { length } = list
    if (!length) return 0
    const chunk = list.get(length - 1)
    // when currentTime is to close to duration, video element doesn't play
    return Math.max(0, chunk.startedAt + chunk.duration - 1)
  }

  get video() {
    return this._video || (this._video = (() => {
      const video = this._getVideoElement()
      if (!video) throw new Error(`try to get video but got empty`)
      return video
    })())
  }

  get isSeeking() {
    return Boolean(this._seekPromise)
  }

  get isPlaying() {
    return this._isPlaying
  }

  get events(): EventEmitterListener<LivePlayerEventMap> {
    return this._events
  }

  countChunks() {
    return this._chunksMetaList.length
  }

  addChunkMeta(iterables: Iterable<ChunkMeta>) {
    const list = this._chunksMetaList
    const map = this._chunksMetaMap
    for (const item of iterables) {
      if (map.get(item.id)) continue
      list.insert(item)
      map.set(item.id, item)
      const endAt = item.startedAt + item.duration
      this._updateDuration(endAt)
    }
  }

  async seek(timepoint: number) {
    const inChunk = this._seekChunk(timepoint)
    if (!inChunk) return

    // when currentTime is to close to duration, video element doesn't play
    const duration = this._duration
    timepoint = Math.max(0, Math.min(timepoint, duration - 1))

    if (timepoint === this._seekTimepoint && this._seekPromise) {
      return this._seekPromise.promise
    }

    const seekId = ++this._seekId
    const seekXp = this._seekPromise || (this._seekPromise = createExternalPromise())
    this._seekTimepoint = timepoint

    try {
      await this._pause(seekId)
      if (seekId !== this._seekId) return

      const mse = this._mse
      const endAt = inChunk.startedAt + inChunk.duration
      const startTime = Math.min(endAt, timepoint) - inChunk.startedAt

      // reset remove buffer stream before reset mse
      this._removeBufferStream.end()
      this._removeBufferStream = new TakeLastStream()
      this._removeBufferStream.pause()

      await mse.reset()
      if (seekId !== this._seekId) return

      this._unregisterVideoEvent()

      this._startChunkId = inChunk.id
      this._currentTime = startTime

      this._loop(seekId)
      this._removeBufferStream.resume()

      const { video } = this
      const xp = createExternalPromise<void>()
      const onDurationChange = () => {
        if (video.duration > 0) {
          video.removeEventListener('durationchange', onDurationChange)
          xp.resolve()
        }
      }
      video.addEventListener('durationchange', onDurationChange)

      await xp.promise
      if (seekId !== this._seekId) return

      const prevPartialStartTime = this._partStartTime
      this._partStartTime = inChunk.startedAt
      video.currentTime = startTime
      this._events.emit('update partialStartTime', this._partStartTime, prevPartialStartTime)

      this._registerVideoEvent()

      if (this._isPlaying) {
        await this._play(seekId)
      }
    } finally {
      seekXp.resolve()
      if (seekId !== this._seekId) return
      this._seekPromise = undefined
    }
  }

  async play() {
    if (this._isDestroyed) return
    return this._playPausePromise(async () => {
      if (this._isDestroyed) return
      if (this._seekPromise) {
        await this._seekPromise.promise
      }
      if (this._isPlaying) return
      this._isPlaying = true
      this._events.emit('update isPlaying', true)
      await this._play(this._seekId)
    })
  }

  async pause() {
    if (this._isDestroyed) return
    return this._playPausePromise(async () => {
      if (this._isDestroyed) return
      if (this._seekPromise) {
        await this._seekPromise.promise
      }
      if (!this._isPlaying) return
      this._isPlaying = false
      this._events.emit('update isPlaying', false)
      await this._pause(this._seekId)
    })
  }

  async destroy() {
    if (this._isDestroyed) return
    this._isDestroyed = true
    this._disposers.clear()
    await this._pause(this._seekId)
    await this._mse.destroy()
    // TODO: more destruction behaviors
  }

  private _play(seekId: number) {
    return this._internalPlayPausePromise(async () => {
      if (seekId !== this._seekId) return
      // when currentTime is to close to duration, play() doesn't resolve promise
      await Promise.race([
        this.video.play(),
        later(100),
      ])
    })
  }

  private _pause(seekId: number) {
    return this._internalPlayPausePromise(() => {
      if (seekId !== this._seekId) return
      this.video.pause()
    })
  }

  private _seekChunk(timepoint: number) {
    const list = this._chunksMetaList
    const { length } = list
    if (length > 0) {
      for (let i = length - 1; i > -1; i--) {
        const item = list.get(i)
        const { startedAt } = item
        if (timepoint < startedAt) continue
        return item
      }
      return list.get(length - 1)
    }
    return undefined
  }

  private _updateDuration(duration: number) {
    const prev = this._duration
    if (duration > prev) {
      this._duration = duration
      this._events.emit('update duration', duration, prev)
      return true
    }
    return false
  }

  private _updateCurrentTime(currentTime: number) {
    this._currentTime = currentTime
  }

  private _registerVideoEvent() {
    const { video } = this
    const onTimeUpdate = () => this._updateCurrentTime(video.currentTime)
    video.addEventListener('timeupdate', onTimeUpdate)
    this._disposers.override('video event', () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
    })
  }

  private _unregisterVideoEvent() {
    this._disposers.dispose('video event')
  }

  private _loop(seekId: number) {
    this._loopPutChunks(seekId)
    this._loopRemoveChunks(seekId)
  }

  private async _loopPutChunks(seekId: number) {
    const mse = this._mse
    const list = this._chunksMetaList
    const map = this._chunksMetaMap

    const MAX_BUFFER_DURATION = 20

    const startChunkId = this._startChunkId
    let id = startChunkId
    while (true) {
      if (this._isDestroyed) return
      if (seekId !== this._seekId) return

      const { length } = list
      if (!length) {
        await later(1000)
        continue
      }

      const lastChunk = list.get(length - 1)
      if (id > lastChunk.id) {
        await later(1000)
        continue
      }

      // this is for streaming, since before first chunk ever arrives,
      // even startChunk is undefined
      const startChunk = map.get(startChunkId)
      if (!startChunk) {
        await later(1000)
        continue
      }

      const chunk = map.get(id)
      if (!chunk) {
        id++
        continue
      }

      const currentTime = this._currentTime

      const chunkStartTime = chunk.startedAt - startChunk.startedAt

      // remove one chunk before curren reading chunk
      for (let i = id - 1, breakCounter = 1; breakCounter > -1 && i > 0; i--) {
        const chunk = map.get(i)
        if (!chunk) continue
        const chunkEndTime = chunk.startedAt + chunk.duration - startChunk.startedAt
        if (chunkEndTime < 0) break
        if (!breakCounter) {
          this._removeBufferStream.write(chunkEndTime)
          break
        }
        if (chunkEndTime < currentTime) {
          breakCounter = 0
          continue
        }
      }

      const chunkEndTime = chunkStartTime + chunk.duration

      if (chunkEndTime - currentTime < MAX_BUFFER_DURATION) {
        const buffer = await client.async('getChunk')(this.roomId, this.liveId, id)
        if (seekId !== this._seekId) return
        mse.add(buffer, chunk.duration)
        const newBufferedDuration = chunkEndTime - this._currentTime
        const durationToWait = newBufferedDuration - MAX_BUFFER_DURATION
        if (durationToWait > 0) {
          await later((durationToWait + 0.05) * 1000)
        }
        id++
        continue
      }

      await later(1000)
    }
  }

  private async _loopRemoveChunks(seekId: number) {
    const mse = this._mse

    const stream = this._removeBufferStream

    while (true) {
      if (this._isDestroyed) return
      if (seekId !== this._seekId) return

      const ret = await stream.read()
      if (this._isDestroyed) return
      if (seekId !== this._seekId) return

      if (ret.done) return
      const endAt = ret.value

      try {
        await mse.removeBefore(0, endAt)
      } catch (e) {
        console.error(e)
      }
    }
  }
}
