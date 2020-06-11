import * as path from 'path'
import { exec } from '../../utils/cli'

const VIDEO_DURATION_REGEXP = /Duration: (.*?), start: (.*?),/

export async function getVideosDuration(filePathList: readonly string[], rootPath?: string) {
  if (!filePathList.length) return []
  const cdPath = rootPath ? path.resolve(process.cwd(), rootPath) : process.cwd()
  const cdCommand = `cd ${JSON.stringify(cdPath)}`
  const inputs = filePathList.map(filePath => `-i ${JSON.stringify(filePath)}`).join(' ')
  const requestCommand = `ffmpeg ${inputs} 2>&1 | grep "Duration"`
  const command = `${cdCommand} && ${requestCommand}`
  const text = await exec(command, { silent: true })
  const lines = text.split('\n')
  return filePathList.map((_, i) => {
    const line = lines[i]
    if (!line) return
    //   Duration: 00:00:02.03, start: 1449.962000, bitrate: 814 kb/s
    const matchInfo = line.match(VIDEO_DURATION_REGEXP)
    if (!matchInfo) return
    const duration = parseDuration(matchInfo[1])
    const start = +matchInfo[2]
    return { duration, start }
  })
}

function parseDuration(text: string) {
  const parts = text.split(':').map(x => +x)
  return ((parts[0] * 60) + parts[1]) * 60 + parts[2]
}
