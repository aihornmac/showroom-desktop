import type { API as ServerAPI } from './server'
import { IPCClient } from '../utils/ipc/client'

class API {}

export type Message = (
  | never
)

export type { API }

const api = new API()

export const ipc = new IPCClient<API, ServerAPI>({ api })
