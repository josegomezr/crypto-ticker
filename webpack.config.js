var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    'crypto_ticker': './src/crypto-ticker.js',
    'btc_calculator': './src/btc-calculator.js',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: '[name]-build.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: 'css-loader'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },{
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        /*
          loader: "url-loader?mimetype=application/font-woff"
        */
        loader: "file-loader",
        options: {
          name: '[name].[ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js'
    }
  },
  devServer: {
    historyApiFallback: true
  },
  performance: {
    hints: "warning"
  },
  externals: {},
  devtool: '#eval-source-map',
  plugins: [new webpack.NamedModulesPlugin(),]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = false;
  module.exports.resolve.alias['vue$'] = 'vue/dist/vue.runtime.min.js'
  module.exports.resolve.alias['numbro$'] = 'numbro/dist/numbro.min.js'
  module.exports.externals['jquery'] = 'jQuery';
  module.exports.externals['font-awesome'] = 'font-awesome';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = ([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.IgnorePlugin(/bootstrap/, /font\-awesome/),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
  ])
}
