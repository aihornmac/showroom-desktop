import { ChunkMeta } from './types'
import { M3U } from '../../utils/m3u'

export function mergeM3UToChunkMetaMap(iterables: Iterable<M3U>) {
  const map = new Map<number, ChunkMeta>()
  for (const m3u of iterables) {
    appendChunkMetaToMap(map, m3u, map)
  }
  return map
}

export function appendChunkMetaToMap(map: Map<number, ChunkMeta>, m3u: M3U, toAppend = new Map<number, ChunkMeta>()) {
  const { mediaSequence, programeDateTime } = m3u.extension
  if (typeof mediaSequence !== 'number' || !programeDateTime) return toAppend
  let i = -1
  let accumulatedDuration = 0
  for (const track of m3u.tracks) {
    i++
    const id = mediaSequence + i
    if (map.has(id)) continue
    const { duration } = track
    const startedAt = +programeDateTime + accumulatedDuration
    accumulatedDuration += duration
    toAppend.set(id, {
      id,
      duration,
      startedAt,
    })
  }
  return toAppend
}

export function mergeChunkMetaMap(assignee: Map<number, ChunkMeta>, assigner: ReadonlyMap<number, ChunkMeta>) {
  for (const [id, data] of assigner) {
    assignee.set(id, data)
  }
}
