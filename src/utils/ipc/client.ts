import { ipcRenderer, IpcRendererEvent } from 'electron'
import {
  IPCCommonOptions,
  DEFAULT_IPC_CHANNEL_NAME,
  Payload,
  RequestPayload,
  ResponsePayload,
  Dethunk,
} from './common'
import type { SyncAPIKeysOf, AsyncAPIKeysOf } from './server'
import { createExternalPromise, ExternalPromise } from '../js'

type MethodFn = (event: IpcRendererEvent) => Function

export type APIKeysOf<T> = string & keyof T & {
  [P in keyof T]: T[P] extends (event: IpcRendererEvent) => (...args: infer _A) => infer R ? (
    // return type of function is unknown or any or never should be reguarded as async
    unknown extends R ? P :
    R extends never ? P :
    // return type of function that is promise should be reguarded as async
    R extends PromiseLike<unknown> ? P :
    never
  ) : never
}[keyof T]

export class IPCClient<
  API extends {} = {},
  Server extends {} = {},
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
    this._dispatchAsync = this._dispatchAsync.bind(this)

    for (const name of [this._syncChannelName, this._asyncChannelName]) {
      if (ipcRenderer.listenerCount(name)) {
        throw new Error(`channel ${JSON.stringify(name)} is in use`)
      }
    }

    ipcRenderer.on(this._asyncChannelName, this._dispatchAsync)
  }

  destroy() {
    if (this._isDestroyed) return
    this._isDestroyed = true
    ipcRenderer.removeListener(this._asyncChannelName, this._dispatchAsync)
  }

  sync<K extends SyncAPIKeysOf<Server>>(name: K): Dethunk<Server[K]> {
    return ((...args: unknown[]) => {
      const id = this._nextRequestId++
      const request: RequestPayload = {
        kind: 'request',
        id,
        name,
        args,
      }
      const response: ResponsePayload = ipcRenderer.sendSync(this._syncChannelName, request)
      if (response.state === 'resolved') {
        return response.value
      }
      throw response.value
    }) as unknown as Dethunk<Server[K]>
  }

  async<K extends AsyncAPIKeysOf<Server>>(name: K): Dethunk<Server[K]> {
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
      ipcRenderer.send(this._asyncChannelName, request)
      return xp.promise
    }) as unknown as Dethunk<Server[K]>
  }

  private _dispatchAsync(event: IpcRendererEvent, input: unknown) {
    const payload = input as Payload
    if (payload.kind === 'request') {
      this._onRequest(event, payload)
    } else if (payload.kind === 'response') {
      this._onResponse(payload)
    }
  }

  private async _onRequest(
    event: IpcRendererEvent,
    request: RequestPayload,
  ) {
    try {
      const fn = (this._api[request.name as keyof API] as unknown as MethodFn)(event)
      const result: unknown = await fn(...request.args)
      const response: ResponsePayload = {
        kind: 'response',
        id: request.id,
        state: 'resolved',
        value: result,
      }
      ipcRenderer.send(this._asyncChannelName, response)
    } catch (e) {
      const response: ResponsePayload = {
        kind: 'response',
        id: request.id,
        state: 'rejected',
        value: e,
      }
      ipcRenderer.send(this._asyncChannelName, response)
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
