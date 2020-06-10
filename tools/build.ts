import { run, exec, execSafe } from './common'

import * as path from 'path'

if (require.main === module) {
  run(main)
}

export async function main() {
  const projectPath = path.join(__dirname, '..')
  const tmpPath = path.join(projectPath, 'tmp')
  const distPath = path.join(projectPath, 'dist')
  const packageJsonPath = path.join(projectPath, 'package.json')
  const assetsPath = path.join(projectPath, 'assets')
  const iconPath = path.join(assetsPath, 'icon.png')

  await execSafe(`rm -rf ${JSON.stringify(tmpPath)}`).promise
  try {
    await exec(`mkdir -p ${JSON.stringify(tmpPath)}`)
    await Promise.all([
      exec(`webpack --config ${JSON.stringify(path.join(__dirname, 'webpack.main.ts'))}`),
      exec(`webpack --config ${JSON.stringify(path.join(__dirname, 'webpack.ui.prod.ts'))}`),
      exec(`cp ${JSON.stringify(packageJsonPath)} ${JSON.stringify(tmpPath + '/')}`)
    ])
    await exec(`electron-packager ${JSON.stringify(tmpPath)} --out ${JSON.stringify(distPath)} --icon ${JSON.stringify(iconPath)} --overwrite`)
  } finally {
    await execSafe(`rm -rf ${JSON.stringify(tmpPath)}`).promise
  }
}
