const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Добавляем полифилы для Node.js модулей
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert"),
        buffer: require.resolve("buffer"),
        process: require.resolve("process/browser"),
        vm: require.resolve("vm-browserify")
        // Добавьте другие необходимые полифилы при необходимости
      };
      

      // Настраиваем ProvidePlugin для автоматического предоставления глобальных переменных
      webpackConfig.plugins = (webpackConfig.plugins || []).concat([
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"]
        })
      ]);

      // Добавляем правило для отключения fullySpecified
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      });

      return webpackConfig;
    }
  }
};
