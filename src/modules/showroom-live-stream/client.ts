import { v4 as uuidv4 } from 'uuid'
import type { API as ServerAPI, MessagePayload } from './server'
import { IPCClient } from '../../utils/ipc/client'
import { ipcRenderer, IpcRendererEvent } from 'electron'

export const client = new IPCClient<{}, ServerAPI>({
  api: {},
  channelName: `showroom-live-stream`,
})

export function subscribeRoomCurrentLive(roomId: number, cb: (data: MessagePayload) => void) {
  const channelName = uuidv4()
  const messageListener = (_event: IpcRendererEvent, data: MessagePayload) => {
    cb(data)
  }
  ipcRenderer.on(channelName, messageListener)
  client.async('subscribeRoomCurrentLive')(channelName, roomId)
  return () => {
    ipcRenderer.off(channelName, messageListener)
    client.async('unsubscribe')(channelName)
  }
}
