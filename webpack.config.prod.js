// Path requires a absolute path
const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
	entry: './src/app.ts', // root entry file
	output: {
		filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'), // absolute path, __dirname is the current directory and globally available on node
	}, // tell typescript what to compile
	devtool: 'none', // source map for debugging
	module: {
		rules: [
			{
				test: /\.ts$/, //Check for files ending with .ts
				use: 'ts-loader', //Use ts-loader to compile the files
				exclude: /node_modules/, //Exclude node_modules
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	plugins: [
		new CleanPlugin.CleanWebpackPlugin()	// clean dist folder before build
	]
};
