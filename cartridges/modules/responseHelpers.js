'use strict';

/**
 * Dependencies
 */
var DMWHelper = require('dmwhelper');

/**
 * Response status Constants
 */
const INFO_NUMBER = '1';
const SUCCESS_NUMBER = '2';
const REDIRECT_NUMBER = '3';
const CLIENT_ERROR_NUMBER = '4';
const SERVER_ERROR_NUMBER = '5';
const SUCCESS_NO_CONTENT = '204';
const CLIENT_ERROR_UNAUTHORIZED = '401';

/**
 * Check first character matching the needle
 * @param {string} string string
 * @param {string} needle string
 * @returns {boolean} true/false
 */
function codeStartsWith(string, needle) {
    var stringCode = '' + string; // In case is an integer
    if (DMWHelper.isEmpty(stringCode) || DMWHelper.isEmpty(needle)) {
        return false;
    }

    return stringCode.substring(0, 1) === needle;
}

/**
 *
 * @param {string} statusCode response status code
 * @returns {boolean} true/false
 */
function isInfo(statusCode) {
    return codeStartsWith(statusCode, INFO_NUMBER);
}

/**
 * @param {string} statusCode response status code
 * @returns {boolean} true/false
 */
function isSuccess(statusCode) {
    return codeStartsWith(statusCode, SUCCESS_NUMBER);
}

/**
 * @param {string} statusCode response status code
 * @returns {boolean} true/false
 */
function isSuccessNoContent(statusCode) {
    var stringCode = '' + statusCode; // In case is an integer
    return stringCode === SUCCESS_NO_CONTENT;
}

/**
 * @param {string} statusCode response status code
 * @returns {boolean} true/false
 */
function isRedirect(statusCode) {
    return codeStartsWith(statusCode, REDIRECT_NUMBER);
}

/**
 * @param {string} statusCode response status code
 * @returns {boolean} true/false
 */
function isClientError(statusCode) {
    return codeStartsWith(statusCode, CLIENT_ERROR_NUMBER);
}

/**
 * @param {string} statusCode response status code
 * @returns {boolean} true/false
 */
function isClientErrorUnauthorized(statusCode) {
    var stringCode = '' + statusCode; // In case is an integer
    return stringCode === CLIENT_ERROR_UNAUTHORIZED;
}

/**
 * @param {string} statusCode response status code
 * @returns {boolean} true/false
 */
function isServerError(statusCode) {
    return codeStartsWith(statusCode, SERVER_ERROR_NUMBER);
}

exports.codeStartsWith = codeStartsWith;
exports.isInfo = isInfo;
exports.isSuccess = isSuccess;
exports.isRedirect = isRedirect;
exports.isClientError = isClientError;
exports.isServerError = isServerError;
exports.isSuccessNoContent = isSuccessNoContent;
exports.isClientErrorUnauthorized = isClientErrorUnauthorized;
