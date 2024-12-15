const path = require('path');
const webpack = require('webpack');

module.exports = (env) => {
    const isLeagueMode = env.LEAGUE_MODE === 'true';

    return {
        mode: 'production',
        entry: './src/room.ts', // Change to .ts if using TypeScript
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isLeagueMode ? 'league.js' : 'pub.js',
        },
        resolve: {
            extensions: ['.ts', '.js', '.json'], // Resolve both .ts and .js extensions
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.LEAGUE_MODE': JSON.stringify(env.LEAGUE_MODE),
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.ts$/, // Use ts-loader for .ts files
                    exclude: /node_modules/,
                    use: 'ts-loader',
                },
            ],
        },
    };
};