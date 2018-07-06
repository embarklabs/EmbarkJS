const path = require('path');

const browser = {
    entry: path.resolve(__dirname, 'dist') + '/browser.js',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/env']
                        ]
                    }
                }
            }
        ]
    },
    // optimization: {
    //     minimize: false
    // },
    output: {
        filename: 'embark.min.js',
        library: 'EmbarkJS',
        libraryTarget: 'umd',
        libraryExport: 'default',
        path: __dirname,
        umdNamedDefine: true,
    },
    target: 'web'
};

module.exports = [
    browser
];
