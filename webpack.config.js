const webpack = require('webpack')
const path = require('path')
const repo = require('./package')

const banner = `${repo.name} ${repo.version} - ${repo.description}\nCopyright (c) ${new Date().getFullYear()} ${repo.author} - ${repo.homepage}\nLicense: ${repo.license}`

module.exports = {
  'context': path.join(__dirname, '/src'),
  'entry': './index.js',
  'output': {
    'path': path.join(__dirname, '/dist'),
    'filename': `${repo.name}.min.js`,
    library: {
      root: 'Mono',
      amd: 'mono',
      commonjs: 'mono'
    },
    libraryTarget: 'umd'
  },
  'module': {
    'loaders': [{
      'test': /\.js$/,
      'exclude': /node_modules/,
      use: [{
        loader: 'buble-loader',
        options: { objectAssign: 'Object.assign' }
      }]
    }]
  },
  'plugins': [
    new webpack.BannerPlugin(banner)
  ]
}
