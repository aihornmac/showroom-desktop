import { BrowserWindow, IpcMainEvent, app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { Client } from '../modules/showroom-api/client'
import * as sr from '../modules/showroom-api'
import type { API as ClientAPI } from './client'
import { exists } from '../utils/fs'
import { niceToHave } from '../utils/flow-control'
import { IPCServer } from '../utils/ipc/server'
import { windowManager } from '../modules/window'
import { getRequestCachePath } from '../modules/app'

class API {
  client = new Client()

  getPlatform() {
    return () => {
      return os.platform()
    }
  }

  getLocale() {
    return () => {
      return app.getLocale()
    }
  }

  close(event: IpcMainEvent) {
    return () => {
      BrowserWindow.fromWebContents(event.sender)!.close()
    }
  }

  isMinimized(event: IpcMainEvent) {
    return () => {
      return BrowserWindow.fromWebContents(event.sender)!.isMinimized()
    }
  }

  isMaximized(event: IpcMainEvent) {
    return () => {
      return BrowserWindow.fromWebContents(event.sender)!.isMaximized()
    }
  }

  isMinimizable(event: IpcMainEvent) {
    return () => {
      return BrowserWindow.fromWebContents(event.sender)!.isMinimizable()
    }
  }

  isMaximizable(event: IpcMainEvent) {
    return () => {
      return BrowserWindow.fromWebContents(event.sender)!.isMaximizable()
    }
  }

  isClosable(event: IpcMainEvent) {
    return () => {
      return BrowserWindow.fromWebContents(event.sender)!.isClosable()
    }
  }

  isResizable(event: IpcMainEvent) {
    return () => {
      return BrowserWindow.fromWebContents(event.sender)!.isResizable()
    }
  }

  minimize(event: IpcMainEvent) {
    return () => {
      BrowserWindow.fromWebContents(event.sender)!.minimize()
    }
  }

  maximize(event: IpcMainEvent) {
    return () => {
      BrowserWindow.fromWebContents(event.sender)!.maximize()
    }
  }

  unmaximize(event: IpcMainEvent) {
    return () => {
      BrowserWindow.fromWebContents(event.sender)!.unmaximize()
    }
  }

  toggleMaximize(event: IpcMainEvent) {
    return () => {
      const win = BrowserWindow.fromWebContents(event.sender)!
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  }

  getLiveOnlines() {
    return async () => {
      const filePath = path.join(getRequestCachePath(), 'live-onlines.json')
      const requestAndWrite = niceToHave(async () => {
        const result = await sr.getLiveOnlines(this.client)
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
        await fs.promises.writeFile(filePath, JSON.stringify(result, null, 2))
        console.log('getLiveOnlines updated')
        return result
      })
      if (!await exists(filePath)) return requestAndWrite
      const buffer = await fs.promises.readFile(filePath)
      return JSON.parse(buffer.toString('utf8')) as sr.GetLiveOnlines.Response
    }
  }

  getTimeTables() {
    return async () => {
      const filePath = path.join(getRequestCachePath(), 'time-table.json')
      console.log({ filePath })
      const requestAndWrite = niceToHave(async () => {
        const result = await sr.getTimeTables(this.client)
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
        await fs.promises.writeFile(filePath, JSON.stringify(result, null, 2))
        console.log('getTimeTables updated')
        return result
      })
      if (!await exists(filePath)) return requestAndWrite
      const buffer = await fs.promises.readFile(filePath)
      return JSON.parse(buffer.toString('utf8')) as sr.GetTimeTables.Response
    }
  }

  openRoom() {
    return async (roomId: number) => {
      windowManager.openRoomPlayer(roomId)
    }
  }
}

export type { API }

const api = new API()

export const ipc = new IPCServer<API, ClientAPI>({
  api,
  channelName: 'common api',
})
