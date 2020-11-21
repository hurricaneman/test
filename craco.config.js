/*
 * @Author: DargonPaul.Y
 * @Date: 2020-07-09 13:18:50
 * @LastEditTime: 2020-07-15 16:50:04
 * @LastEditors: DargonPaul.Y
 * @Description:
 * @FilePath: \admin-frontpage\craco.config.js
 */

const CopyPlugin = require('copy-webpack-plugin')
const target = 'http://172.16.13.51:2081'

module.exports = {
  babel: {
    plugins: [
      '@babel/plugin-proposal-optional-chaining',
      ['import', { libraryName: 'antd' }],
    ],
  },
  webpack: {
    plugins: [
      new CopyPlugin([
        'node_modules/antd/dist/antd.min.css',
        'node_modules/videojs-swf/dist/video-js.swf',
      ]),
    ],
  },
  devServer: {
    proxy: {
      '/cvtri-app': { target },
      '/cvtri_app': { target },
      '/cvtri-cqvmm': { target },
      '/cvtri_cqvmm': { target },
    },
  },
}
