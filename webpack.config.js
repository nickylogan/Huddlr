const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    entry: {
        landing: './src/client/landing.js',
        worldRoom: './src/client/worldRoom.js',
        privateRoom: './src/client/privateRoom.js',
        server: './src/client/server.js',
    },
    devServer: {
        hot: true,
    },
    output: {
        path: path.resolve(__dirname, 'public/assets'),
        publicPath: '/assets/',
        filename: '[name].bundle.js',
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.s?css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].bundle.css'
        })
    ]
}