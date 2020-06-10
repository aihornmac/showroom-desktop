import * as path from 'path'
import { app } from 'electron'

export function getDataPath() {
  return path.join(app.getPath('userData'), 'showroom-desktop')
}

export function getLiveCachePath() {
  return path.join(getDataPath(), 'live-cache')
}

export function getRequestCachePath() {
  return path.join(getDataPath(), 'request-cache')
}
