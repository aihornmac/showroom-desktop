import * as webpack from 'webpack'
import 'webpack-dev-server'
import * as merge from 'webpack-merge'
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { get as getCommonConfig } from './webpack.ui.common'

export default get()

export function get(): webpack.Configuration {
  return merge(getCommonConfig(), {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
            },
          ],
        },
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: `[name].[chunkhash:8].css`,
      }),
    ]
  })
}
