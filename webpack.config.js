'use strict';

const path = require('path');
const glob = require('glob');
const WebpackExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackCleanPlugin = require('clean-webpack-plugin');
const WebpackCopyPlugin = require('copy-webpack-plugin');
const WebpackStyleLintPlugin = require('stylelint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
var sfraBuilderConfig = require('./webpackHandling/sfraBuilderConfig');
const webpackHelper = require('./webpackHandling/helper');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
process.noDeprecation = true;

/**
 * Multicartridge webpack configuration.
 */
class WebpackBundle {
    /**
     * Scans the cartridge client side source folder and returns an
     * object with sass and javascript files.
     *
     * @param {string} cartridge - The cartridge name
     * @param {string} fileType - Either js/jsx or scss
     * @return {Object} - Object of sass and js files
     */
    static scanEntryPoints(cartridge = 'app_storefront_base', fileType) {
        const srcPath = path.resolve(__dirname, cartridge, 'cartridge/client');
        const srcSCSSPath = path.join(srcPath, '*', 'scss', '**', '*.scss');
        const srcJSPath = path.join(srcPath, '*', 'js', '**', '*.js');
        const srcJSXPath = path.join(srcPath, '*', 'jsx', '*.jsx');
        let files = {};

        // Scan scss files
        if (fileType === 'scss') {
            glob.sync(srcSCSSPath)
                .filter(source => !path.basename(source).startsWith('_'))
                .map((source) => {
                    let sourceRelativePath = path.dirname(path.relative(srcPath, source));
                    sourceRelativePath = sourceRelativePath.split(path.sep);
                    sourceRelativePath[1] = sourceRelativePath[1].replace('scss', 'css');
                    sourceRelativePath = sourceRelativePath.join(path.sep);
                    const sourceName = path.basename(source).replace('scss', 'css');
                    const outputFile = path.join(sourceRelativePath, sourceName);
                    files[outputFile] = source;
                    return source;
                });
        }


        // Scan js files
        if (fileType === 'js') {
            glob.sync(srcJSPath)
                .filter(source => !path.basename(source).startsWith('_'))
                .map((source) => {
                    const sourceRelativePath = path.dirname(path.relative(srcPath, source));
                    const sourceName = path.basename(source);
                    const outputFile = path.join(sourceRelativePath, sourceName);
                    files[outputFile] = source;

                    return source;
                });

            // Scan jsx files. The output file will copy to static/default/js folder.
            glob.sync(srcJSXPath)
                .map((source) => {
                    const sourceRelativePath = path.dirname(path.relative(srcPath, source));
                    const sourceName = path.basename(source);
                    const outputFile = path.join(
                        sourceRelativePath.replace('jsx', 'js'),
                        sourceName.replace('.jsx', '.js')
                    );

                    files[outputFile] = source;

                    return source;
                });
        }
        return files;
    }

    /**
    * Base plugins.
    * @param {string} fileType - determines compilation type
    * @return {array} - Array of Plugins
    */
    static getBasePlugins(fileType) {
        if (fileType !== 'scss') {
            return [
                new WebpackExtractTextPlugin('[name]')
            ];
        }
        return [
            new WebpackStyleLintPlugin({ files: 'src/**/*.scss' }),
            new WebpackExtractTextPlugin('[name]')
        ];
    }

    /**
     * Webpack uses aliases for module resolving, we build this dynamically so the same alias
     * can be used for a different file type
     * @param {Object} cartridgeAliases - Aliases which are avaible for module resolution
     * @param {string} fileType - JS/JSX or scss
     * @returns {Object} More dynamic aliases
     */
    static buildDynamicAliases(cartridgeAliases, fileType) {
        let aliases = {};
        let aliasKeys = Object.keys(cartridgeAliases);
        for (const key of aliasKeys) { // eslint-disable-line
            aliases[key] = cartridgeAliases[key] + '/' + fileType;
        }
        return aliases;
    }

    /**
    * Returns the webpack config object tree.
    *
    * @param {string} env - Environment variable
    * @param {string} cartridge - The cartridge name
    * @param {string} fileType - Either js/jsx or scss
    * @return {Object} - Webpack config
    */
    static bundleCartridge(env = 'dev', cartridge, fileType) {
        const isDevelopment = (env !== undefined && env.dev === true);
        const onlyscss = env.onlyscss === true;
        const onlyjs = env.onlyjs === true;
        const outputPath = path.resolve(__dirname, cartridge, 'cartridge', 'static');
        var requiredFiles = ['*/js', '*/jsx', '*/css'];
        if (onlyscss) requiredFiles = ['*/css'];
        if (onlyjs) requiredFiles =  ['*/js', '*/jsx']; 
        let cartridgeAliases = (sfraBuilderConfig.aliasConfig !== undefined) ? sfraBuilderConfig.aliasConfig.alias : {};
        let ruleSet = webpackHelper.buildRuleSet(__dirname, cartridge, isDevelopment, fileType);
        let plugins = this.getBasePlugins(cartridge, fileType);
        let entryFiles = this.scanEntryPoints(cartridge, fileType);
        const aliases = this.buildDynamicAliases(cartridgeAliases, fileType);

        if (Object.keys(entryFiles).length === 0) {
            // Cartridge does not include any static files to compile
            return {};
        }
        if (fileType === 'js') {
            plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerMode: 'disabled',
                    generateStatsFile: true,
                    statsOptions: { source: false },
                    statsFilename: '../../../../js_report/' + cartridge + '.' + fileType + '.json'
                })
            )
        }
        
        plugins.push(new WebpackCleanPlugin(requiredFiles, {
            root: path.resolve(__dirname, cartridge, 'cartridge', 'static'),
            verbose: false
        }));

        if (!isDevelopment) {
            plugins.push(new TerserPlugin());
        }

        if (sfraBuilderConfig.aliasConfig.alias[cartridge]) {
            plugins.push(new WebpackCopyPlugin(sfraBuilderConfig.aliasConfig.alias[cartridge]));
        }
        if (sfraBuilderConfig.copyConfig[cartridge]) {
            plugins.push(new WebpackCopyPlugin(sfraBuilderConfig.copyConfig[cartridge]));
        }

        return {
            mode: isDevelopment ? 'development' : 'production',
            name: cartridge + '/' + fileType,
            stats: { children: false },
            entry: entryFiles,
            output: {
                path: outputPath,
                filename: '[name]'
            },
            resolve: {
                alias: aliases
            },
            module: {
                rules: ruleSet
            },
            plugins: plugins,
            devtool: isDevelopment ? 'source-map' : undefined,
            cache: true
        };
    }
}

module.exports = env => {
    var bundlesFiles = [];
    if(env.ca === true){
        sfraBuilderConfig = require('./webpackHandling/sfraBuilderConfigCa');
    }
    sfraBuilderConfig.cartridges.map(cartridge => { // eslint-disable-line
       env.onlyscss === true ? null : bundlesFiles.push(WebpackBundle.bundleCartridge(env, cartridge, 'js'));
       env.onlyjs === true ? null : bundlesFiles.push(WebpackBundle.bundleCartridge(env, cartridge, 'scss'));
    });
    return bundlesFiles;
};