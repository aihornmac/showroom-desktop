import * as webpack from 'webpack'
import 'webpack-dev-server'
import * as merge from 'webpack-merge'
import { get as getCommonConfig } from './webpack.ui.common'

export default get()

export function get(): webpack.Configuration {
  return merge(getCommonConfig(), {
    mode: 'development',

    devtool: 'eval-source-map',

    devServer: {
      host: 'localhost',
      port: 9102,
      compress: true,
      historyApiFallback: true,
      noInfo: false,
      stats: {
        assets: false,
        chunks: false,
        modules: false,
        warnings: false,
        colors: true,
        errors: true,
        errorDetails: true
      },
      clientLogLevel: 'error',
      disableHostCheck: true,
    },

    stats: 'normal',
  })
}
