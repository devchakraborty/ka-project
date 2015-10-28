var autoprefixer = require('autoprefixer');
var webpack = require('webpack');

module.exports = {
	entry: {
		javascript: './html/src/js/index.js',
		html: './html/src/index.html'
	},
	output: {
		path: './html/build',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.(html)$/, loader: 'file?name=[name].[ext]'
			},
			{
				test: /\.js$/, exclude: /node_modules/, loader: 'source-map!babel'
			},
			{
				test: /\.(css|scss)$/, loader: 'ie8-style!css!postcss!sass'
			},
			{
				test: /\.json$/, loader: 'json'
			}
		]
	},
	devServer: {
		contentBase: './build',
		historyApiFallback: true,
		port: process.env.PORT || 8080
	},
	postcss: function() {
		return [autoprefixer];
	},
	plugins: process.env.NODE_ENV == 'production' ? [new webpack.optimize.UglifyJsPlugin({minimize:true, comments:false})] : [],
	devtool: 'source-map'
};
