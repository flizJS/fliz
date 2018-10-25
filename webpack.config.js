const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// webpack.config.js
module.exports = {
    entry: [
        "./js/index.js",
        "./style/index.js"
    ],
    output: {
        filename: 'fliz.js',
        publicPath: "/dist"
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "fliz.css"
        }),
        new OptimizeCssAssetsPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader, //"style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            }
        ]
    },
    watch: true
}