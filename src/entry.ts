import { app, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { main } from './main'

run(bootstrap)

async function bootstrap() {
  await main({ url: { kind: 'file', value: path.join('ui', 'index.html') } })
}

async function run<T>(fn: () => T | PromiseLike<T>): Promise<void> {
  try {
    await fn()
  } catch (e) {
    console.error(e)
    try {
      dialog.showErrorBox('Boostrap Error', String(e))
    } catch (e) {
      await fs.promises.appendFile(path.join(app.getPath('logs'), `error.${Date.now()}.log`), e)
    }
    process.exit(1)
  }
}
