import { app, BrowserWindow } from 'electron'
import './ipc/server'
import * as server from './ipc/server'
import { MaybePromise } from './utils/types'

export interface MainOptions {
  readonly url: string
  readonly interceptors?: Partial<MainInterceptors>
}

export interface MainInterceptors {
  ready(): MaybePromise<void>
  afterBindEvent(): MaybePromise<void>
  afterCreateWindow(win: BrowserWindow): MaybePromise<void>
  afterFirstRender(win: BrowserWindow): MaybePromise<void>
}

export async function main(options: MainOptions) {
  await app.whenReady()

  await options?.interceptors?.ready?.()

  app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  await options?.interceptors?.afterBindEvent?.()

  createWindow()

  async function createWindow() {
    const win = server.createWindow()

    await options?.interceptors?.afterCreateWindow?.(win)

    await win.loadURL(options.url)

    await options?.interceptors?.afterFirstRender?.(win)
  }
}
