import * as fs from 'fs'
import { Client } from '../showroom/api/client'
import * as sr from '../showroom/api'
import type { API as ClientAPI } from './client'
import { exists } from '../utils/fs'
import { niceToHave } from '../utils/flow-control'
import { IPCServer } from '../utils/ipc/server'
import { BrowserWindow, IpcMainEvent } from 'electron'

class API {
  client = new Client()

  toggleMaximize(event: IpcMainEvent) {
    return () => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (!win) return
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
}

export type Message = (
  | never
)

export type { API }

const api = new API()

export const ipc = new IPCServer<API, ClientAPI>({ api })
