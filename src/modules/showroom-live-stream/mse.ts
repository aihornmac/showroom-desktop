// This file describes a Media Source Extension for sliced mpeg2-ts file
import * as muxjs from 'mux.js'

import { ExternalPromise, createExternalPromise } from '../../utils/js'
import { PipeStream } from '../../utils/stream'

export class MSE {
  readonly url: string

  private readonly _ms: MediaSource
  private _sb?: SourceBuffer
  private _addSourceIdlePromise?: ExternalPromise<void>
  private _isDestroyed: boolean
  private readonly _sourceOpenPromise: Promise<void>
  private _demuxer: Demuxer
  private _loopId: number

  constructor() {
    const ms = this._ms = new MediaSource()
    const url = this.url = URL.createObjectURL(ms)

    this._isDestroyed = false
    this._loopId = 0

    this._demuxer = new Demuxer()

    const sourceOpenXp = createExternalPromise<void>()
    this._sourceOpenPromise = sourceOpenXp.promise

    const onSourceOpen = () => {
      ms.removeEventListener('sourceopen', onSourceOpen)
      URL.revokeObjectURL(url)
      if (this._isDestroyed) return
      const mime = `video/mp4; codecs="mp4a.40.2,avc1.64001f"`
      const sb = this._sb = ms.addSourceBuffer(mime)
      sb.addEventListener('updateend', () => {
        const xp = this._addSourceIdlePromise
        if (xp) {
          this._addSourceIdlePromise = undefined
          xp.resolve()
        }
      })
      sourceOpenXp.resolve()
    }

    ms.addEventListener('sourceopen', onSourceOpen)

    this._loopAddSource(this._loopId)
  }

  getBufferRange() {
    const sb = this._sb
    if (!sb) return
    const { buffered } = sb
    const { length } = buffered
    if (!length) return
    return {
      start: buffered.start(0),
      end: buffered.end(0),
    }
  }

  // get sourceBuffer() {
  //   const ret = this._sb
  //   if (!ret) throw new Error(`Sourcebuffer is not created`)
  //   return ret
  // }

  ready() {
    return this._sourceOpenPromise
  }

  async reset() {
    if (this._ms.readyState !== 'open') {
      return this._sourceOpenPromise
    }
    const sb = this._sb
    if (!sb) return
    const loopId = ++this._loopId
    this._demuxer.destroy()
    this._demuxer = new Demuxer()

    while (true) {
      if (this._sb?.updating) {
        await this._getSourceIdlePromise()
        continue
      }
      break
    }
    if (loopId !== this._loopId) return

    this._ms.duration = 0

    const { buffered } = sb
    const { length } = buffered
    if (length) {
      while (true) {
        if (this._sb?.updating) {
          await this._getSourceIdlePromise()
          continue
        }
        break
      }
      if (loopId !== this._loopId) return

      const end = buffered.end(length - 1)
      sb.remove(0, buffered.end(length - 1))
    }
    this._loopAddSource(this._loopId)
  }

  async removeBefore(startTimepoint: number, endTimepoint: number) {
    const sb = this._sb
    if (!sb) return

    startTimepoint = Math.max(0, startTimepoint)
    if (startTimepoint >= endTimepoint) return

    const loopId = this._loopId

    while (true) {
      if (this._sb?.updating) {
        await this._getSourceIdlePromise()
        continue
      }
      break
    }
    if (loopId !== this._loopId) return

    if (sb.buffered.length) {
      sb.remove(startTimepoint, endTimepoint)
    }
  }

  add(buffer: Uint8Array, duration: number) {
    this._demuxer.input.write({ buffer, duration })
  }

  async destroy() {
    if (this._isDestroyed) return
    this._isDestroyed = true
    if (this._ms.readyState === 'open') {
      while (true) {
        if (this._sb?.updating) {
          await this._getSourceIdlePromise()
          continue
        }
        break
      }
      this._ms.endOfStream()
    }
  }

  private async _loopAddSource(loopId: number) {
    try {
      while (true) {
        if (this._isDestroyed) return
        if (this._loopId !== loopId) return

        const output = await this._demuxer.output.read()
        // output is closed, end loop
        if (output.done) return

        if (this._isDestroyed) return
        if (this._loopId !== loopId) return

        while (true) {
          if (this._sb?.updating) {
            await this._getSourceIdlePromise()
            continue
          }
          break
        }

        if (this._isDestroyed) return
        if (this._loopId !== loopId) return

        const { buffer, duration } = output.value
        const ms = this._ms
        ms.duration = (ms.duration || 0) + duration
        this._sb!.appendBuffer(buffer)
      }
    } catch (e) {
      console.error(e)
      if (this._loopId !== loopId) return
      await this.destroy()
    }
  }

  private _getSourceIdlePromise() {
    let xp = this._addSourceIdlePromise
    if (!xp) this._addSourceIdlePromise = xp = createExternalPromise()
    return xp.promise
  }

  // private async _ensureWritable() {
  //   while (true) {
  //     if (this._sb?.updating) {
  //       let xp = this._addSourceIdlePromise
  //       if (!xp) {
  //         this._addSourceIdlePromise = xp = createExternalPromise()
  //       }
  //       await xp.promise
  //       continue
  //     }
  //     return
  //   }
  // }
}

interface BufferPayload {
  readonly buffer: Uint8Array
  readonly duration: number
}

class Demuxer {
  private _isDestroyed: boolean
  private _count: number
  private readonly _transmuxer: muxjs.mp4.Transmuxer
  private readonly _inputStream: PipeStream<BufferPayload>
  private readonly _muxIdle: PipeStream<void>
  private readonly _outputStream: PipeStream<BufferPayload>

  constructor() {
    this._isDestroyed = false

    this._count = 0

    // reusing transmuxer to keep correct timeoffset
    this._transmuxer = new muxjs.mp4.Transmuxer()

    this._inputStream = new PipeStream()

    this._muxIdle = new PipeStream()

    this._outputStream = new PipeStream()

    this._transmuxer.on('error', console.error)

    this._muxIdle.write()

    this._loop()
  }


  get input() {
    return this._inputStream
  }

  get output() {
    return this._outputStream
  }

  destroy() {
    if (this._isDestroyed) return
    this._isDestroyed = true
  }

  private async _loop() {
    try {
      while (true) {
        if (this._isDestroyed) return

        const idle = await this._muxIdle.read()
        // idle is closed, end loop
        if (idle.done) return

        if (this._isDestroyed) return

        const input = await this._inputStream.read()
        // input stream is closed, end loop
        if (input.done) return

        if (this._isDestroyed) return

        const count = this._count++
        const { buffer, duration } = input.value
        const transmuxer = this._transmuxer
        if (!count) {
          transmuxer.on('data', segment => {
            this._transmuxer.off('data')
            if (this._isDestroyed) return
            const data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength)
            data.set(segment.initSegment, 0)
            data.set(segment.data, segment.initSegment.byteLength)
            this._outputStream.write({ buffer: data, duration })
            this._muxIdle.write()
          })
        } else {
          transmuxer.on('data', segment => {
            this._transmuxer.off('data')
            if (this._isDestroyed) return
            const data = new Uint8Array(segment.data)
            this._outputStream.write({ buffer: data, duration })
            this._muxIdle.write()
          })
        }
        transmuxer.push(buffer)
        transmuxer.flush()
      }
    } catch (e) {
      console.error(e)
      this.destroy()
    }
  }
}
