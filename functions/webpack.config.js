module.exports = {
    devtool: 'source-map',
    entry: ['./src/index.ts'],
    output: {
        path: 'lib',
        filename: 'index.js'
    },
    resolve: {
        extension: ['', '.ts', '.tsx']
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loaders: ['ts-loader']
            }
        ]
    }
};