const path = require('path');

/**
 * Allows to configure aliases for you require loading
 */
module.exports.aliasConfig = {
    // enter all aliases to configure

    alias: {
        base: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            'cartridges/app_storefront_base/cartridge/client/default/',
        ),

        app_storefront_TFGDavid: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            'cartridges/app_storefront_TFGDavid/cartridge/client/default/',
        )
    },
};

module.exports.sfraFolderName = 'salesforce-storefront-reference-architecture';
/**
 * Allows copying files to static folder
 */
module.exports.copyConfig = {
    'cartridges/app_storefront_base': [
    ],
    'cartridges/app_storefront_TFGDavid': [
    ]
};

/**
 * Exposes cartridges included in the project
 */
module.exports.cartridges = [
    'cartridges/app_storefront_base',
    'cartridges/app_storefront_TFGDavid'
];
