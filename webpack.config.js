const path = require('path');

module.exports = env => {
  const isDev = env.mode === 'development';
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `policyline${isDev ? '': '.min'}.js`,
      library: 'policyline',
      libraryTarget: 'commonjs2'
    },
    externals: {
      moment: {
        commonjs: 'moment',
        commonjs2: 'moment'
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{
            loader: 'babel-loader',
            query: {
              presets: ['es2015']
            }
          }]
        }
      ]
    },
    stats: {
      colors: true
    },
    devtool: isDev ? 'source-map' : undefined,
    optimization: {
      minimize: !isDev
    }
  };
};