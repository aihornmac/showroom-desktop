import * as path from 'path'
import type { Configuration } from 'webpack'
import * as HappyPack from 'happypack'
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'

const projectPath = path.join(__dirname, '..')
const srcPath = path.join(projectPath, 'src')
const tmpPath = path.join(projectPath, 'tmp')
// const tsConfigPath = path.join(__dirname, 'tsconfig.main.build.json')
const tsConfigPath = path.join(srcPath, 'tsconfig.main.build.json')

module.exports = getWebpackConfiguration()

function getWebpackConfiguration(): Configuration {
  return {
    target: 'electron-main',

    context: projectPath,

    entry: path.join(srcPath, 'entry.ts'),

    output: {
      path: path.join(tmpPath, 'main'),
      filename: 'entry.js',
      libraryTarget: 'umd',
    },

    devtool: 'source-map',

    resolve: {
      extensions: ['.tsx', '.ts', '.mjs', '.js']
    },

    stats: 'errors-only',

    node: {
      __dirname: false,
    },

    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/,
          exclude: m => m.includes('node_modules'),
          use: [{
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: tsConfigPath,
            },
          }],
        },
      ],
    },

    plugins: [
      new HappyPack({
        id: 'ts',
        loaders: [
          {
            loader: 'ts-loader',
            options: {
              happyPackMode: true,
              transpileOnly: true,
              configFile: tsConfigPath,
            }
          }
        ],
      }),
      new ForkTsCheckerWebpackPlugin({
        silent: true,
        tsconfig: tsConfigPath,
      }),
    ],
  }
}
