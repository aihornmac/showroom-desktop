import { app, BrowserWindow } from 'electron'
import './ipc.register'
import { windowManager } from './modules/window'

export interface MainOptions {
  readonly url: {
    readonly kind: 'file' | 'url'
    readonly value: string
  }
}

export async function main(options: MainOptions) {
  await app.whenReady()

  const { url } = options
  windowManager.setEntry(url.kind, url.value)

  app.on('before-quit', () => {
    windowManager.isForceQuit = true
  })

  app.on('activate', () => {
    let hasShown = false
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isMinimized()) continue
      win.show()
      hasShown = true
    }
    if (!hasShown) {
      windowManager.main.show()
    }
  })

  app.on('window-all-closed', () => {})

  windowManager.main.show()
}
