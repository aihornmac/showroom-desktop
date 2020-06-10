import { ipcMain, IpcMainEvent, WebContents } from 'electron'
import {
  IPCCommonOptions,
  DEFAULT_IPC_CHANNEL_NAME,
  Payload,
  RequestPayload,
  ResponsePayload,
  Dethunk,
} from './common'
import type { APIKeysOf as ClientAPIKeysOf } from './client'
import { createExternalPromise, ExternalPromise, isThenable } from '../js'

type MethodFn = (event: IpcMainEvent) => Function

// export type APIKeysOf<T> = string & keyof T & {
//   [P in keyof T]: T[P] extends (event: IpcMainEvent) => Function ? P : never
// }[keyof T]

type Thenable = { readonly then: Function }

export type SyncAPIKeysOf<T> = string & keyof T & {
  [P in keyof T]: (
    T[P] extends (event: IpcMainEvent, method: 'sync' | 'async') => (...args: infer _A) => infer R ? (
      // return type of function is unknown or any or never should be reguarded as sync
      unknown extends R ? P :
      R extends never ? P :
      // return type of function that only contains promise should be reguarded as not sync
      Exclude<R, Thenable> extends never ? never :
      P
    ) : never
  )
}[keyof T]

export type AsyncAPIKeysOf<T> = string & keyof T & {
  [P in keyof T]: (
    T[P] extends (event: IpcMainEvent, method: 'sync' | 'async') => (...args: infer _A) => infer R ? (
      // return type of function is unknown or any or never should be reguarded as async
      unknown extends R ? P :
      R extends never ? P :
      // return type of function that only contains promise should be reguarded as async
      Exclude<R, Thenable> extends never ? P :
      never
    ) : never
  )
}[keyof T]

export class IPCServer<
  API extends {} = {},
  Client extends {} = {},
> {
  private _isDestroyed: boolean
  private _channelName: string
  private _syncChannelName: string
  private _asyncChannelName: string
  private _api: API
  private _nextRequestId: number
  private _requests: Map<number, ExternalPromise>

  constructor(options: IPCCommonOptions<API>) {
    this._isDestroyed = false
    this._nextRequestId = 0
    this._requests = new Map()
    this._api = options.api
    this._channelName = options.channelName || DEFAULT_IPC_CHANNEL_NAME
    this._syncChannelName = `${this._channelName}:sync`
    this._asyncChannelName = `${this._channelName}:async`
    this._dispatchSync = this._dispatchSync.bind(this)
    this._dispatchAsync = this._dispatchAsync.bind(this)

    for (const name of [this._syncChannelName, this._asyncChannelName]) {
      if (ipcMain.listenerCount(name)) {
        throw new Error(`channel ${JSON.stringify(name)} is in use`)
      }
    }

    ipcMain.on(this._syncChannelName, this._dispatchSync)
    ipcMain.on(this._asyncChannelName, this._dispatchAsync)
  }

  destroy() {
    if (this._isDestroyed) return
    this._isDestroyed = true
    ipcMain.removeListener(this._syncChannelName, this._dispatchSync)
    ipcMain.removeListener(this._asyncChannelName, this._dispatchAsync)
  }

  request<K extends ClientAPIKeysOf<Client>>(sender: WebContents, name: K): Dethunk<Client[K]> {
    return ((...args: unknown[]) => {
      const id = this._nextRequestId++
      const request: RequestPayload = {
        kind: 'request',
        id,
        name,
        args,
      }
      const xp = createExternalPromise()
      this._requests.set(id, xp)
      sender.send(this._asyncChannelName, request)
      return xp.promise
    }) as unknown as Dethunk<Client[K]>
  }

  private _dispatchSync(event: IpcMainEvent, input: unknown) {
    const payload = input as Payload
    if (payload.kind === 'request') {
      this._onRequest('sync', event, payload)
    }
  }

  private _dispatchAsync(event: IpcMainEvent, input: unknown) {
    const payload = input as Payload
     if (payload.kind === 'request') {
      this._onRequest('async', event, payload)
    } else if (payload.kind === 'response') {
      this._onResponse(payload)
    }
  }

  private _onRequest(
    method: 'sync' | 'async',
    event: IpcMainEvent,
    request: RequestPayload,
  ) {
    try {
      const fn = (this._api[request.name as keyof API] as unknown as MethodFn)(event)
      const result: unknown = fn(...request.args)
      if (isThenable(result)) {
        // resolve as promise
        if (method === 'sync') {
          throw new Error(`server method ${request.name} should return non-promise`)
        }
        (async () => result)().then(value => {
          const response: ResponsePayload = {
            kind: 'response',
            id: request.id,
            state: 'resolved',
            value,
          }
          if (!event.sender.isDestroyed()) {
            event.reply(this._asyncChannelName, response)
          }
        }, error => {
          const response: ResponsePayload = {
            kind: 'response',
            id: request.id,
            state: 'rejected',
            value: error,
          }
          if (!event.sender.isDestroyed()) {
            event.reply(this._asyncChannelName, response)
          }
        })
      } else {
        const response: ResponsePayload = {
          kind: 'response',
          id: request.id,
          state: 'resolved',
          value: result,
        }
        if (!event.sender.isDestroyed()) {
          if (method === 'sync') {
            event.returnValue = response
          } else {
            event.reply(this._asyncChannelName, response)
          }
        }
      }
    } catch (e) {
      const response: ResponsePayload = {
        kind: 'response',
        id: request.id,
        state: 'rejected',
        value: e,
      }
      if (!event.sender.isDestroyed()) {
        if (method === 'sync') {
          event.returnValue = response
        } else {
          event.reply(response)
        }
      }
    }
  }

  private _onResponse(
    request: ResponsePayload,
  ) {
    const { id } = request
    const requests = this._requests
    const xp = requests.get(id)
    if (!xp) return
    requests.delete(id)
    if (request.state === 'resolved') {
      xp.resolve(request.value)
    } else {
      xp.reject(request.value)
    }
  }
}
