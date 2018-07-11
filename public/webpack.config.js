module.exports = [{
    entry: {
        index: './src/index.js'
    },
    module: {
        rules: [
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
        ]
    },
    output: {
        filename: '[name].bundle.js',
        path: __dirname + '/scripts'
    },
    mode: 'production'
}];