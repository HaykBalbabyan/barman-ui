const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const fs = require('fs');

const jsFiles = () => fs.readdirSync(path.resolve(__dirname, 'resources/js'))
    .filter(file => file.endsWith('.js'))
    .reduce((acc, file) => {
        const entryName = path.basename(file, '.js');
        acc[entryName] = path.resolve(__dirname, `resources/js/${file}`);
        return acc;
    }, {});


module.exports = (env) => {

    const isProd = env === 'production';

    const config = {
        mode: 'production',
        entry: {
            ...jsFiles()
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, '/js'),
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        format: {
                            comments: false,
                        },
                        compress: {
                            drop_console: isProd,
                        },
                        mangle: isProd,
                    },
                    extractComments: false,
                }),
            ],
            splitChunks: {
                chunks: 'async',
            },
        },
        plugins: [
            new CompressionPlugin({
                filename: '[path][base].gz',
                algorithm: 'gzip',
                test: /\.(js|css|html|svg)$/,
                threshold: 10240,
                minRatio: 0.8,
            })
        ],
    };

    if (!isProd){
        config.devtool = 'source-map';
    }

    return config;
};
