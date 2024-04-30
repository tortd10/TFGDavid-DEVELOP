'use strict';

var Site = require('dw/system/Site');
var URLUtils = require('dw/web/URLUtils');
var Logger = require('dw/system/Logger');

//--------------------------------------------------
// Public Interface
//--------------------------------------------------

/**
 * @constructor
 * @classdesc DMWHelper implements some static methods for accessing some methods and functions frequently used.
 */
var DMWHelper = {};

/**
* Gets the ID for the current site
* @returns {string}
*/
DMWHelper.getSiteID = function () {
    return Site.current.getID();
}

/**
* Gets an array with all sites in the instance.
* @returns {Array}
*/
DMWHelper.getAllSites = function () {
    return Site.current.getAllSites().toArray();
}

/**
* Calculates the site availability considering the type of the instance and the site status.
* @param {Number} siteStatus - Number representing the site status
* @returns {boolean}
*/
DMWHelper.isSiteAvailable = function (siteStatus) {
    return (siteStatus === Site.SITE_STATUS_PROTECTED) || (siteStatus === Site.SITE_STATUS_ONLINE);
}

/**
* Gets the default locale for the current site
* @returns {string}
*/
DMWHelper.getSiteLocale = function () {
    return Site.current.getDefaultLocale();
}

/**
* Gets the value of a custom preference for the current site
* @param {string} id - Id of the preference
* @returns {Object} The preference value, or null if there is no preference with the given id
*/
DMWHelper.getPreference = function (id) {
    return Site.current.getCustomPreferenceValue(id);
}

/**
 * Gets the current locale
 * @returns {string}
 */
DMWHelper.getCurrentLocale = function () {
    return require('dw/util/Locale').getLocale(request.getLocale()).getLanguage();
}

/**
* Returns an absolute URL with protocol and host from current request taking a custom preference as the action.
* @param {string} id - Id of the preference
* @returns {string} The string representation of the absolute URL
*/
DMWHelper.getURLFromPreference = function (id) {
    return URLUtils.abs(Site.current.getCustomPreferenceValue(id), '').toString(); 
}

/**
* Checks if a given object is null or undefined
* @param {Object} isEmptyObject - The object to be checked
* @returns {boolean} True if the given object is null or undefined
*/
DMWHelper.isEmpty = function (isEmptyObject) {
    return (isEmptyObject === null) || (isEmptyObject === undefined) || (isEmptyObject === '');
}

/**
* Sets token params in session.privacy.
* @param {Object} token params received from service
*/
DMWHelper.setAlfabeticoTokenParams = function (req, getTokenResponse) {
    
    req.session.privacyCache.set(
        'oauth_token_issued',
        getTokenResponse.issuedTime
    );
    
    req.session.privacyCache.set(
        'oauth_token_expiration',
        getTokenResponse.expires_in
    );

   if (Site.current.getCustomPreferenceValue('alfabeticoEnableSplittinCharacters')) { 
       req.session.privacyCache.set(
            'oauth_access_token',
            getTokenResponse.access_token.substr(0, 1000)
        );
        var otherPart = getTokenResponse.access_token.split(/(.{1000})/).filter(function(x) {return x.length > 0});
        var size = otherPart.length - 1;
        req.session.privacyCache.set(
            'token_split_length', 
            size
        );

        req.session.privacyCache.set(
            'token_split_length',
            size
        );
      
        for (var i = 1; i < otherPart.length; i += 1) { // eslint-disable-line
            req.session.privacyCache.set(
                'oauth_access_token' + i, 
                otherPart[i]
            );
        }
    } else {
        req.session.privacyCache.set(
        'oauth_access_token',
        getTokenResponse.access_token
        );
    }
    
    req.session.privacyCache.set(
        'oauth_refresh_token',
        getTokenResponse.refresh_token
    );
}

/**
* Gets token stored in session.privacy. This param is automatically cleared when the customer logs out
* @returns {Object} token stored in session
*/
DMWHelper.getAlfabeticoToken = function () {
    // eslint-disable-next-line no-undef
    var token = session.privacy.oauth_access_token; 
    return token;
}

/**
* Gets token params stored in session.privacy. This param is automatically cleared when the customer logs out
* @returns {Object} token stored in session
*/
DMWHelper.getAlfabeticoTokenParams = function () {
    // eslint-disable-next-line no-undef
    var tokenParams = {
        token: session.privacy.oauth_access_token,
        refreshToken: session.privacy.oauth_refresh_token,
        tokenTimeIssued: session.privacy.oauth_token_issued,
        tokenExpiration: session.privacy.oauth_token_expiration,
        tokenExpirationTime: session.privacy.oauth_token_issued + (session.privacy.oauth_token_expiration * 1000)
    }
    return tokenParams;
}

/**
* Inserts conditionally a new log message. It will insert the message only if the values of the custom preference passed is true.
* @param {string} logCat - Name of the logger category
* @param {string} flag - Id of the preference
* @param {string} level - Log level for the message ('debug' | 'info' | 'warn' | 'error')
* @param {string} message - The message to be inserted in the log
* @returns {void}
*/
DMWHelper.conditionalLog = function (logCat,flag,level,message){
    var logger = Logger.getLogger(logCat,logCat);
    var flagValue = Site.current.getCustomPreferenceValue(flag);
    if (flagValue === true && flagValue !== null){
        switch (level) {
            case 'info':
                logger.info(message);
            break; 
            case 'error':
                logger.error(message);
            break;
            case 'warn':
                logger.warn(message);
            break;
            case 'debug':
                logger.debug(message);
            break;                    
        }
    }
}

/**
 * Gets the current site currency
 * @returns {string}
 */
DMWHelper.getCurrency = function () {
    return Site.current.getDefaultCurrency();
}

/**
 * @param {object} object {}
 * @param {string} value some value
 * @return {string} object key
 */
DMWHelper.getKeyByValue = function(object, value) {
    return Object.keys(object).find(function (key) {
        return object[key] === value;
    });
}

/**
 * Insert key in session
 * @param {string} key key that should be saved into the session
 * @param {string} value some value
 * @return {void} save object into the session
 */
DMWHelper.setValueInSession = function(key, value) {
    var splittedPart = value.split(/(.{1000})/).filter(function(x) {return x.length > 0});
    var size = splittedPart.length;
    if (size == 1) {
        session.privacy[key] = value; 
    } else {
        session.privacy[key + '_length'] = size;
        for (var i = 0; i < splittedPart.length; i += 1) { // eslint-disable-line
            session.privacy[ key + '_splitted_part_' + i] = splittedPart[i];
        }
    }
}


/**
 * get key from session
 * @param {string} key
 * @return {string} object key
 */
DMWHelper.getValuefromSession = function(key) {
    var length =  session.privacy[key + '_length'];
    if (!length) {
        return  session.privacy[key];
    };
    var results = '';
    for (var i = 0; i < length; i += 1) { // eslint-disable-line
        results += session.privacy[key + '_splitted_part_' + i]; 
    }
    return results;
}

/**
 * remove key from session
 * @param {string} key key that should be saved into the session
 * @param {string} value some value
 * @return {void} save object into the session
 */
DMWHelper.removeFromSession = function(key) {
    var length =  session.privacy[key + '_length'];
    if (!length) {
        delete session.privacy[key];
    };

    for (var i = 0; i < length; i += 1) { // eslint-disable-line
        delete session.privacy[ key + '_splitted_part_' + i];
    }
    delete session.privacy[key + '_length'];
    
}

module.exports = DMWHelper;