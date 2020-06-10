import { M3U } from '../../utils/m3u'

export interface PlayListFile {
  raw: string
  parsed?: M3U
}

export interface ChunkMeta {
  readonly id: number
  readonly duration: number
  readonly startedAt: number
}
