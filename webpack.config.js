const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: 'development',
    entry: {
        landing: './src/client/landing.js',
        globalRoom: './src/client/room-global.js',
        privateRoom: './src/client/room-private.js'
    },
    devServer: {
        hot: true,
    },
    output: {
        path: path.resolve(__dirname, 'public/assets'),
        filename: "[name].bundle.js",
        publicPath: '/assets/',
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.scss$/,
                use: [ MiniCssExtractPlugin.loader, "css-loader", "sass-loader" ]
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new MiniCssExtractPlugin({ filename: "[name].bundle.css" })
    ]
}