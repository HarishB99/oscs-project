const autoprefixer = require('autoprefixer');
module.exports = [{
    entry: './scripts/app.js',
    module: {
        rules: [
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: __dirname
    }
}];