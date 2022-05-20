// Path requires a absolute path
const { resolve } = require('path');
const path = require('path');

module.exports = {
    mode: 'development',
	entry: './src/app.ts', // root entry file
	output: {
		filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'), // absolute path, __dirname is the current directory and globally available on node
        publicPath: '/dist/' // relative path
	}, // tell typescript what to compile
	devtool: 'inline-source-map', // source map for debugging
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
};
