const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // TODO: remove later
  devServer: {
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    }
  }
  // End of TODO
})
