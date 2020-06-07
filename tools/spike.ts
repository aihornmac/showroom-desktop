import * as fs from 'fs'
import * as path from 'path'
import { Client } from '../src/showroom/api/client'
import { getLiveOnlines } from '../src/showroom/api/live-onlines'
import { run } from './common'

run(main)

async function main() {
  const client = new Client()
  const data = await getLiveOnlines(client)
  console.log(data)
  await fs.promises.writeFile(path.join(__dirname, 'live-onlines.json'), JSON.stringify(data, null, 2))
}
