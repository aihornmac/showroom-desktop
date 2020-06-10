import type { API as ServerAPI, MessagePayload } from './server'
import { IPCClient } from '../../utils/ipc/client'
import { ipcRenderer, IpcRendererEvent } from 'electron'

export const client = new IPCClient<{}, ServerAPI>({
  api: {},
  channelName: `showroom-live-stream`,
})

export function subscribe(channelName: string, roomId: number, cb: (data: MessagePayload) => void) {
  const messageListener = (_event: IpcRendererEvent, data: MessagePayload) => {
    cb(data)
  }
  ipcRenderer.on(channelName, messageListener)
  client.async('subscribe')(channelName, roomId)
  return () => {
    ipcRenderer.off(channelName, messageListener)
    client.async('unsubscribe')(channelName)
  }
}
