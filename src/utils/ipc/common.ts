export const DEFAULT_IPC_CHANNEL_NAME = '__default__ipc__channel__'

export interface IPCCommonOptions<API extends {}> {
  readonly api: API
  readonly channelName?: string
}

export type Dethunk<T> = T extends (...args: infer _A) => infer R ? R : never

export type Payload = (
  | APIPayload
  | MessagePayload
)

export type APIPayload = (
  | RequestPayload
  | ResponsePayload
)

export interface RequestPayload {
  readonly kind: 'request'
  readonly id: number
  readonly name: string
  readonly args: readonly unknown[]
}

export interface ResponsePayload {
  readonly kind: 'response'
  readonly id: number
  readonly state: 'resolved' | 'rejected'
  readonly value: unknown
}

export interface MessagePayload {
  readonly kind: 'message'
  readonly data: unknown
}
