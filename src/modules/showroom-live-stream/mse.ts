// This file describes a Media Source Extension for sliced mpeg2-ts file
import * as muxjs from 'mux.js'

import { call } from '../../utils/js'
import { Stream, mergeStreamResults } from '../../utils/stream'

export class MSE {
  readonly url: string

  private _ms: MediaSource
  private _sb!: SourceBuffer
  private _transmuxer: muxjs.mp4.Transmuxer
  private _muxStream: Stream<Uint8Array>
  private _addSourceIdle: Stream<void>
  private _count: number
  private _isDestroyed: boolean

  constructor() {
    const ms = this._ms = new MediaSource()
    const url = this.url = URL.createObjectURL(ms)

    this._count = 0
    this._isDestroyed = false

    // reusing transmuxer to keep correct timeoffset
    this._transmuxer = new muxjs.mp4.Transmuxer()

    this._muxStream = new Stream()

    this._addSourceIdle = new Stream()

    ms.addEventListener('sourceopen', () => {
      URL.revokeObjectURL(url)
      if (this._isDestroyed) return
      const mime = `video/mp4;codecs=avc1.42001e`
      const sb = this._sb = ms.addSourceBuffer(mime)
      sb.addEventListener('updateend', () => {
        this._addSourceIdle.write()
      })
      this._addSourceIdle.write()
    })

    this._transmuxer.on('data', segment => {
      if (this._isDestroyed) return
      if (this._count++) {
        this._muxStream.write(new Uint8Array(segment.data))
      } else {
        const data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
        data.set(segment.initSegment, 0);
        data.set(segment.data, segment.initSegment.byteLength);
        this._muxStream.write(data)
      }
    })

    this._loop()
  }

  add(typedArray: Uint8Array) {
    const transmuxer = this._transmuxer
    transmuxer.push(typedArray);
    transmuxer.flush()
  }

  destroy() {
    if (this._isDestroyed) return
    this._isDestroyed = true
    call(async () => {
      const ms = this._ms
      const sb = this._sb
      this._muxStream.end()
      const addSourceStream = this._addSourceIdle
      if (ms.readyState === 'open') {
        if (sb.updating) {
          await addSourceStream.readLast() || addSourceStream.read()
        }
        addSourceStream.end()
        this._ms.endOfStream()
      }
    })
  }

  private async _loop() {
    try {
      while (true) {
        if (this._isDestroyed) return

        const yields = await Promise.all([
          this._muxStream.read(),
          this._addSourceIdle.read(),
        ] as const)

        if (this._isDestroyed) return

        const { value } = mergeStreamResults(yields)
        if (!value) break
        const [buffer] = value
        this._sb.appendBuffer(buffer)
      }
    } catch (e) {
      console.error(e)
      this.destroy()
    }
  }
}


// // Create your transmuxer:
// //  initOptions is optional and can be omitted at this time.
// const transmuxer = new muxjs.mp4.Transmuxer()

// // Create an event listener which will be triggered after the transmuxer processes data:
// //  'data' events signal a new fMP4 segment is ready
// transmuxer.on('data', function (segment) {
//   // This code will be executed when the event listener is triggered by a Transmuxer.push() method execution.
//   // Create an empty Uint8Array with the summed value of both the initSegment and data byteLength properties.
//   let data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);

//   // Add the segment.initSegment (ftyp/moov) starting at position 0
//   data.set(segment.initSegment, 0);

//   // Add the segment.data (moof/mdat) starting after the initSegment
//   data.set(segment.data, segment.initSegment.byteLength);

//   // Uncomment this line below to see the structure of your new fMP4
//   // console.log(muxjs.mp4.tools.inspect(data));

//   // Add your brand new fMP4 segment to your MSE Source Buffer
//   sourceBuffer.appendBuffer(data);
// })

// // When you push your starting MPEG-TS segment it will cause the 'data' event listener above to run.
// // It is important to push after your event listener has been defined.
// transmuxer.push(transportStreamSegment)
// transmuxer.flush()
