'use strict';

/**
 * @namespace Default
 */

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

/** when sitepath is defined in the site aliases from business manager, homepage will be rendered directly */
/**
 * Default-Start : This end point is the root of the site, when opening from the BM this is the end point executed
 * @name Base/Default-Start
 * @function
 * @memberof Default
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - cache.applyDefaultCache
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Start', consentTracking.consent, cache.applyDefaultCache, function (req, res, next) {
    var Site = require('dw/system/Site');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');

    pageMetaHelper.setPageMetaTags(req.pageMetaData, Site.current);

	var Site = require('dw/system/Site');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
	var catalogMgr = require('dw/catalog/CatalogMgr');
	var Categories = require('*/cartridge/models/categories');
    var siteRootCategory = catalogMgr.getSiteCatalog().getRoot();


	var topLevelCategories = siteRootCategory.hasOnlineSubCategories() ?
            siteRootCategory.getOnlineSubCategories() : null;
			
    var viewData = res.getViewData(); 
	viewData.categories =  new Categories(topLevelCategories);
	var i=0;
	while(topLevelCategories.length != i){
		viewData.categories.categories[i].img = topLevelCategories[i].image;
		i++;
	}

    res.render('/home/homePage', viewData);
    next();
}, pageMetaData.computedPageMetaData);

/** Renders the maintenance page when a site has been set to "Maintenance mode" */
server.get('Offline', cache.applyDefaultCache, function (req, res, next) {
    res.render('siteOffline');
    next();
});
 

module.exports = server.exports();
