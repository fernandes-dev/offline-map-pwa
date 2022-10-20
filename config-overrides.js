/* config-overrides.js */

const WorkboxWebpackPlugin = require('workbox-webpack-plugin')

module.exports = function override(config, _) {
  config.plugins = config.plugins.map(plugin => {
    if (plugin.constructor.name === 'GenerateSW') {
      return new WorkboxWebpackPlugin.InjectManifest({
        swSrc: './src/sw.js',
        swDest: 'service-worker.js'
      })
    }

    return plugin
  })

  return config
}
