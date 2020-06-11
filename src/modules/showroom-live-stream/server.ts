import * as path from 'path'
import * as fs from 'fs'
import { IPCServer } from '../../utils/ipc/server'
import { IpcMainEvent } from 'electron'
import { client } from '../showroom-api/client'
import { getLiveInfo } from '../showroom-api/live-info'
import { Disposers } from '../../utils/disposers'
import { RoomCurrentLiveRecorder, Event as RecorderEvent, getRoomLiveCachePath } from './recorder'
import { Draft } from '../../utils/types'
import { readChunksMeta } from './reader'

class API {
  readonly currentLiveRecorderMap = new Map<number, RoomCurrentLiveRecorder>()
  readonly disposersMap = new Map<string, Disposers>()

  getLiveInfo() {
    return (roomId: number) => getLiveInfo(client, { roomId })
  }

  readFile() {
    return async (filePath: string) => {
      const buf = await fs.promises.readFile(filePath)
      return new Uint8Array(buf.buffer)
    }
  }

  getChunk() {
    return async (roomId: number, liveId: number, chunkId: number) => {
      const chunkPath = path.join(getRoomLiveCachePath(roomId, liveId), 'chunks', `${chunkId}.ts`)
      const buf = await fs.promises.readFile(chunkPath)
      return new Uint8Array(buf.buffer)
    }
  }

  getChunksMeta() {
    return async (roomId: number, liveId: number) => {
      return readChunksMeta(getRoomLiveCachePath(roomId, liveId))
    }
  }

  recordRoomCurrentLive() {
    return async (roomId: number) => {
      const recorder = this.getOrCreateRoomCurrentLiveRecorder(roomId)
      return recorder.liveId
    }
  }

  subscribeRoomCurrentLive(event: IpcMainEvent) {
    const { sender } = event

    return async (channelName: string, roomId: number) => {
      const isDestroyed = () => sender.isDestroyed()

      const disposers = new Disposers()
      this.disposersMap.set(channelName, disposers)

      const recorder = this.getOrCreateRoomCurrentLiveRecorder(roomId)

      disposers.add('recorder logs', recorder.subscribe(data => {
        if (isDestroyed()) {
          disposers.clear()
          return
        }
        sender.send(channelName, createMessage({
          kind: 'recorder',
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

  private getOrCreateRoomCurrentLiveRecorder(roomId: number) {
    const map = this.currentLiveRecorderMap
    let recorder = map.get(roomId)
    if (!recorder) map.set(roomId, recorder = new RoomCurrentLiveRecorder(roomId))
    return recorder
  }
}

function createMessage<T extends MessagePayload>(data: T): T {
  return data
}

export type MessagePayload = {
  kind: 'recorder'
  data: Draft<RecorderEvent>
}

export type { API }

export const server = new IPCServer<API, {}>({
  api: new API(),
  channelName: `showroom-live-stream`,
})
