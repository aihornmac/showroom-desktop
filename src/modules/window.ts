import { BrowserWindow, BrowserWindowConstructorOptions, screen } from 'electron'

export interface WindowManagerHooks {
  afterCreateWindow(win: BrowserWindow): void
}

class WindowManager {
  isForceQuit = false

  private _hooks: { [P in keyof WindowManagerHooks]?: Array<WindowManagerHooks[P]> } = {}
  private _roomPlayers = new Map<number, BrowserWindow>()
  private _main?: BrowserWindow
  private _entry?: {
    readonly type: 'url' | 'file'
    readonly value: string
  }

  setEntry(type: 'url' | 'file', value: string) {
    this._entry = { type, value }
  }

  get main() {
    return this._main || (this._main = this._createMain())
  }

  redirectWindow(win: BrowserWindow, pathname: string) {
    const entry = this._getEntry()
    const url = pathname === '/' ? entry.value : `${entry.value}/#${pathname}`
    if (entry.type === 'file') {
      win.loadFile(url)
    } else {
      win.loadURL(url)
    }
  }

  private _getEntry() {
    const entry = this._entry
    if (!entry) throw new Error(`Can't access entry before setting it!`)
    return entry
  }

  private _createMain() {
    const win = createWindow()

    // const playerWindow = server.createWindow()
    win.on('close', e => {
      if (!this.isForceQuit) {
        e.preventDefault()
        win.hide()
      }
    })

    this._emit('afterCreateWindow')(win)

    this.redirectWindow(win, '/')

    return win
  }

  getRoomPlayer(roomId: number) {
    return this._roomPlayers.get(roomId)
  }

  async openRoomPlayer(roomId: number) {
    const players = this._roomPlayers
    let win = players.get(roomId)
    if (!win) {
      win = this._createRoomPlayer(roomId)
      players.set(roomId, win)
      this._emit('afterCreateWindow')(win)
    }
    win.show()
    return win
  }

  private _createRoomPlayer(roomId: number) {
    const win = createWindow()
    this.redirectWindow(win, `/player/${roomId}`)
    return win
  }

  intercept<K extends keyof WindowManagerHooks>(key: K, fn: WindowManagerHooks[K]): this {
    const map = this._hooks
    const list = map[key] || (map[key] = [])
    list?.push(fn)
    return this
  }

  private _emit<K extends keyof WindowManagerHooks>(key: K): WindowManagerHooks[K] {
    return (...args) => {
      const list = this._hooks[key]
      if (!list) return
      for (const fn of list as readonly Function[]) {
        fn(...args)
      }
    }
  }
}

export type { WindowManager }

export const windowManager = new WindowManager()

function createWindow(options?: BrowserWindowConstructorOptions) {
  const { width, height } = getGoodWindowDimension()
  return new BrowserWindow({
    width,
    height,
    frame: false,
    titleBarStyle: 'customButtonsOnHover',
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      ...options?.webPreferences,
    },
    show: false,
    ...options,
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
