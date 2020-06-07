import * as path from 'path'
import * as webpack from 'webpack'
import * as HappyPack from 'happypack'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import * as SpeedMeasurePlugin from "speed-measure-webpack-plugin"

export const projectPath = path.join(__dirname, '..')
export const sourcePath = path.join(projectPath, 'src')
export const uiPath = path.join(sourcePath, 'ui')
export const entryPath = path.join(uiPath, 'entry.tsx')

export const outputPath = path.join(projectPath, 'tmp')

export const smp = new SpeedMeasurePlugin({
  disable: !process.env.MEASURE
})

export default smp

export function get() {
  return smp.wrap(getWebpackConfig())
}

function getWebpackConfig(): webpack.Configuration {
  return {
    mode: 'production',
    target: 'electron-renderer',
    context: sourcePath,
    entry: entryPath,
    output: {
      path: outputPath,
      publicPath: './',
      globalObject: `(typeof self !== 'undefined' ? self : this)`
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    module: {
      rules: [
        {
          test: /\.(jpe?g|png|gif|mp3|ogg|wav|ogv|mov|mp4|webm|svg|ttf|eot|woff|tsv)/,
          loader: 'file-loader',
          options: {
            limit: 2000
          }
        },
        {
          test: /\.(t|j)sx?$/,
          use: 'happypack/loader?id=ts',
          include: (m) => !m.includes('node_modules'),
        },
        {
          test: /worker\/browser\.(t|j)sx?$/,
          use: [
            {
              loader: 'worker-loader',
              options: {
                inline: false
              }
            },
            'happypack/loader?id=ts'
          ],
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },

    devtool: 'source-map',

    stats: 'errors-only',

    plugins: [
      new HappyPack({
        id: 'ts',
        loaders: [
          {
            loader: 'ts-loader',
            options: {
              happyPackMode: true,
              transpileOnly: true,
              configFile: path.join(__dirname, 'tsconfig.build.json'),
            }
          }
        ],
      }),

      new HtmlWebpackPlugin({
        title: `Showroom Desktop`,
        inject: true
      }),

      new webpack.NamedModulesPlugin(),
    ]
  }
}
