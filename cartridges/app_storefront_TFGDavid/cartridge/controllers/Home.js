'use strict';

/**
 * @namespace Home
 */

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

server.extend(module.superModule);

server.prepend('Show', function (req, res, next) {
    var Site = require('dw/system/Site');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
	var catalogMgr = require('dw/catalog/CatalogMgr');
	var Categories = require('*/cartridge/models/categories');
    var siteRootCategory = catalogMgr.getSiteCatalog().getRoot();


	var topLevelCategories = siteRootCategory.hasOnlineSubCategories() ?
            siteRootCategory.getOnlineSubCategories() : null;
			
    var viewData = res.getViewData(); 
	viewData.categories =  new Categories(topLevelCategories);
    
    next();
});

module.exports = server.exports();
