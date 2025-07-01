/* webpack.config.js */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 1️⃣  Punto de entrada de la app
  entry: './src/index.js',

  // 2️⃣  Salida del bundle
  output: {
    path: path.resolve(__dirname, 'dist'), // carpeta de salida
    filename: 'bundle.js',                 // nombre del bundle
    publicPath: '/',                       // rutas absolutas para SPA
    clean: true                            // limpia dist/ antes de cada build
  },

  // 3️⃣  Reglas de carga
  module: {
    rules: [
      {
        test: /\.jsx?$/,                   // JS y JSX
        exclude: /node_modules/,
        use: 'babel-loader'
      }
      // Añade aquí otros loaders (CSS, imágenes…) si los necesitas
    ]
  },

  // 4️⃣  Plugins
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'), // HTML base
      filename: 'index.html',          // quedará en dist/index.html
      inject: 'body',                  // inserta <script> al final
      scriptLoading: 'defer'           // carga diferida
    })
  ],

  // 5️⃣  Dev-server (sólo durante desarrollo local)
  devServer: {
    static: './public',                // sirve assets estáticos
    historyApiFallback: true,          // para rutas de SPA
    proxy: { '/api': 'http://backend:5000' }, // reenvía peticiones API
    port: 3000
  },

  // 6️⃣  Resolución de extensiones
  resolve: {
    extensions: ['.js', '.jsx']
  },

  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
};
