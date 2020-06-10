import type { API as ServerAPI } from './server'
import { IPCClient } from '../utils/ipc/client'
import { once } from '../utils/js'

class API {}

export type Message = (
  | never
)

export type { API }

const api = new API()

export const ipc = new IPCClient<API, ServerAPI>({
  api,
  channelName: 'common api',
})

export const getPlatform = once(() => ipc.sync('getPlatform')())

export const getIsMinimizable = once(() => ipc.sync('isMinimizable')())

export const getIsMaximizable = once(() => ipc.sync('isMaximizable')())

export const getIsResizable = once(() => ipc.sync('isResizable')())

export const getIsClosable = once(() => ipc.sync('isClosable')())
