module.exports = {
  resolve: {
    fallback: {
      'buffer': require.resolve('buffer/'),
      'stream': require.resolve('stream-browserify'),
      'crypto': require.resolve('crypto-browserify'),
      'url': require.resolve('url/'),
      'querystring': require.resolve('querystring-es3'),
      'http': require.resolve('stream-http')
    }
  }
}
