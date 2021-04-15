var webpack = require('webpack');
var path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, './'),
    entry: {
        'ng-app': './src/ts/ng-app'
    },
    output: {
        filename: './bundle/[name].js'
    },
    resolve: {
        modulesDirectories: ['node_modules'],
        extensions: ['', '.ts', '.js']
    },
    externals: {
        "jquery": "jQuery",
        "underscore": "_",
        "angular": "angular",
        "moment" : "moment",
        "rxjs": "Rx",
    },
    devtool: "source-map",
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },
    plugins: [
        new UglifyJSPlugin({
            sourceMap: true
        })
    ]
}