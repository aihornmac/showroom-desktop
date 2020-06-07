import * as Webpack from 'webpack'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import type { AddressInfo } from 'net'
import type { Server } from 'http'
import * as WebpackDevServer from 'webpack-dev-server'
import { app, session } from 'electron'
import { get } from './webpack.ui.dev'

import { run } from './common'
import { main } from '../src/main'
import { predicate } from '../src/utils/js'
import { exists } from '../src/utils/fs'
import { niceToHave } from '../src/utils/flow-control'

const EXTENSION_PATH = path.join(os.homedir(), `Library/Application Support/Google/Chrome/Default/Extensions`)

run(bootstrap)

async function bootstrap() {
  const config = get()
  const compiler = Webpack(config)

  const webpackDevServer = new WebpackDevServer(compiler, config.devServer)

  const host = config.devServer?.host ?? 'localhost'
  const port = config.devServer?.port ?? 8080

  const server = await new Promise<Server>((resolve, reject) => {
    const server = webpackDevServer.listen(port, host, error => {
      error ? reject(error) : resolve(server)
    })
  })

  const address = server.address()
  const addressStr = address === null ? `${host}:${port}` : stringifyAddress(address)
  const url = `http://${addressStr}`

  const [reactDevToolPath] = await Promise.all([
    getExtensionPath('fmkadmapgofadopljbjfkapdkoienihi'),
  ])

  const extensions = [reactDevToolPath].filter(predicate)

  console.log('loading extensions', extensions)

  app.on('ready', async () => {
    niceToHave(async () => {
      await Promise.all(extensions.map(extension => {
        return session.defaultSession.loadExtension(extension)
      }))
    })
  })

  await main({
    url,
    interceptors: {
      afterCreateWindow(win) {
        win.webContents.openDevTools()
      },
    }
  })
}

function stringifyAddress(address: AddressInfo | string) {
  if (typeof address === 'string') return address
  if (address.family === 'IPv6') {
    return `${address.address}::${address.port}`
  }
  return `${address.address}:${address.port}`
}

async function getExtensionPath(id: string) {
  if (!await exists(EXTENSION_PATH)) return
  const reactPath = path.join(EXTENSION_PATH, id)
  if (!await exists(reactPath)) return
  const filenames = await fs.promises.readdir(reactPath)
  for (const filename of filenames) {
    const versionPath = path.join(reactPath, filename)
    const stat = await exists(versionPath)
    if (!stat) continue
    if (stat.isDirectory()) return versionPath
  }
  // return reactPath
  return
}
