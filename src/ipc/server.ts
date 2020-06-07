import { BrowserWindow, IpcMainEvent, screen } from 'electron'
import * as fs from 'fs'
import * as os from 'os'
import { Client } from '../showroom/api/client'
import * as sr from '../showroom/api'
import type { API as ClientAPI } from './client'
import { exists } from '../utils/fs'
import { niceToHave } from '../utils/flow-control'
import { IPCServer } from '../utils/ipc/server'

class API {
  client = new Client()

  getPlatform() {
    return () => {
      return os.platform()
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
      const filePath = `/Users/aihornmac/Documents/工作文档/github/showroom-desktop/docs/showroom-api-response/live-onlines.json`
      const requestAndWrite = niceToHave(async () => {
        const result = await sr.getLiveOnlines(this.client)
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
      const filePath = `/Users/aihornmac/Documents/工作文档/github/showroom-desktop/docs/showroom-api-response/time-table.json`
      const requestAndWrite = niceToHave(async () => {
        const result = await sr.getTimeTables(this.client)
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

    }
  }
}

export type Message = (
  | never
)

export type { API }

const api = new API()

export const ipc = new IPCServer<API, ClientAPI>({ api })

export function createWindow() {
  const { width, height } = getGoodWindowDimension()
  return new BrowserWindow({
    width,
    height,
    frame: false,
    titleBarStyle: 'customButtonsOnHover',
    webPreferences: {
      nodeIntegration: true,
    },
  })
}

const WINDOW_MIN_WIDTH = 480
const WINDOW_MIN_HEIGHT = 270
const WINDOW_DEFAULT_WIDTH = 1280
const WINDOW_DEFAULT_HEIGHT = 720

function getGoodWindowDimension() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const scale = Math.min(1, width / WINDOW_DEFAULT_WIDTH * .8, height / WINDOW_DEFAULT_HEIGHT * .8)
  return {
    width: Math.min(width, Math.max(WINDOW_MIN_WIDTH, WINDOW_DEFAULT_WIDTH * scale)),
    height: Math.min(height, Math.max(WINDOW_MIN_HEIGHT, WINDOW_DEFAULT_HEIGHT * scale)),
  }
}
