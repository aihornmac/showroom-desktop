import * as path from 'path'
import * as fs from 'fs'
import { PlayListFile, ChunkMeta } from './types'
import { M3U } from '../../utils/m3u'
import { mergeM3UToChunkMetaMap } from './common'
import { getVideosDuration } from '../ffmpeg'
import { predicate } from '../../utils/js'
import { exists } from '../../utils/fs'

// export async function readCacheInfo(rootPath: string) {
//   const chunksPath = path.join(rootPath, 'chunks')
//   // const playListsPath = path.join(rootPath, 'playlists')
//   // const playLists = await readPlayLists(playListsPath)
//   // const chunkMetaMapFromPlayLists = mergeM3UToChunkMetaMap(playLists.values())

// }

export async function readChunksMeta(rootPath: string) {
  const chunksPath = path.join(rootPath, 'chunks')
  const chunksInfoPath = path.join(rootPath, 'chunks-info')
  const cached = await readChunksMetaFromCache(chunksInfoPath)
  const fresh = await readChunksMetaFromChunks(chunksPath, cached)
  if (fresh.size) {
    await fs.promises.mkdir(chunksInfoPath, { recursive: true })
    await Promise.all(Array.from(fresh.values()).map(async meta => {
      await fs.promises.writeFile(path.join(chunksInfoPath, `${meta.id}.json`), JSON.stringify(meta, null, 2))
    }))
  }
  return new Map([...cached, ...fresh])
}

export async function readChunksMetaFromChunks(chunksPath: string, excludes: ReadonlyMap<number, unknown>) {
  const map = new Map<number, ChunkMeta>()
  if (!await exists(chunksPath)) return map
  const filenames = await fs.promises.readdir(chunksPath)
  const chunks = filenames.map(filename => {
    const idMatch = filename.match(/^([0-9]+?)\.ts$/)
    if (!idMatch) return
    const id = +idMatch[1]
    if (excludes.has(id)) return
    return { id, filename }
  }).filter(predicate)
  const infoList = await getVideosDuration(chunks.map(x => x.filename), chunksPath)
  for (let i = 0; i < chunks.length; i++) {
    const info = infoList[i]
    if (!info) continue
    const chunk = chunks[i]
    map.set(chunk.id, {
      id: chunk.id,
      duration: info.duration,
      startedAt: info.start,
    })
  }
  return map
}

export async function readChunksMetaFromCache(chunksInfoPath: string) {
  const map = new Map<number, ChunkMeta>()
  if (!await exists(chunksInfoPath)) return map
  const filenames = await fs.promises.readdir(chunksInfoPath)
  await Promise.all(filenames.map(async filename => {
    try {
      if (!filename.match(/\.json$/)) return
      const buffer = await fs.promises.readFile(path.join(chunksInfoPath, filename))
      const json: ChunkMeta = JSON.parse(buffer.toString('utf8'))
      map.set(json.id, json)
    } catch (e) {
      console.error(e)
    }
  }))
  return map
}

// export async function readPlayLists(playListsPath: string) {
//   const filenames = await fs.promises.readdir(playListsPath)
//   const map = new Map<string, M3U>()
//   await Promise.all(filenames.map(async filename => {
//     try {
//       if (!filename.match(/\.json$/)) return
//       const buffer = await fs.promises.readFile(path.join(playListsPath, filename))
//       const json: PlayListFile = JSON.parse(buffer.toString('utf8'))
//       const m3u = json.parsed
//       if (!m3u) return
//       map.set(filename, m3u)
//     } catch (e) {
//       console.error(e)
//     }
//   }))
//   return map
// }
