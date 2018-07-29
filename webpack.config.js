module.exports = [{
    entry: {
        index: './src/index.js',
        login: './src/login.js',
        rule: './src/rule.js',
        profile: './src/profile.js',
        edit_rule: './src/edit_rule.js',
        account: './src/account.js',
        delete_rule: './src/delete_rule.js'
    },
    module: {
        rules: [
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
        ]
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/public/scripts'
    },
    mode: 'production'
}];