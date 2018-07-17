const path = require('path');

const standalone = {
    entry: path.join(__dirname, 'dist/browser', 'browser.js'),
    mode: 'production',
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
