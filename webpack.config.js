const path = require('path');

const standalone = {
    entry: path.resolve(__dirname, 'src') + '/browser.js',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        plugins: [
                            "@babel/plugin-transform-runtime"
                        ],
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
        globalObject: 'typeof self !== \'undefined\' ? self : this',
        library: 'EmbarkJS',
        libraryTarget: 'umd',
        libraryExport: 'default',
        path: __dirname,
        umdNamedDefine: true,
    },
    target: 'web'
};

module.exports = [
    standalone
];
