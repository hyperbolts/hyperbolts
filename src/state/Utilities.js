/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

// Mounted components
const mounted = {};

// Next UUID
let uuid = 0;

/**
 * Return object containing references of
 * components listening to store.
 *
 * @return {object} mounted components
 */
const getListeningComponents = () => mounted;

/**
 * Return array of component source objects.
 *
 * @param  {object} component react component
 * @return {array}            sources
 */
const getSources = component => {
    const props    = component.props || {};
    const location = props.location || {};
    let i;

    // Retrieve sources
    const sources = component.getSources(
        require('..').uri, // eslint-disable-line global-require
        props.params,
        location.query
    );

    // If sources is a string, parse into array
    if (typeof sources === 'string') {
        return [
            {
                source: sources
            }
        ];
    }

    // Retrieve sources length
    const {length} = sources.length;

    // Make sure all sources are objects
    for (i = 0; i < length; i++) {
        if (typeof sources[i] === 'string') {
            sources[i] = {
                source: sources[i]
            };
        }
    }

    // Return array of sources
    return sources;
};

/**
 * Return whether the passed source is a full URL.
 *
 * @param  {string} source source
 * @return {bool}          is full URL
 */
const isUrl = source => {
    switch (true) {
        case source.substr(0, 7) === 'http://':
        case source.substr(0, 8) === 'https://':
        case source.substr(0, 2) === '//':
            return true;
        default:
            return false;
    }
};

/**
 * Parse parsed source into a full URL.
 *
 * @param  {string} source source
 * @return {string}        parsed source
 */
const parseUrl = source => {

    // If source is a URI string, add protocol and host
    if (isUrl(source) === false) {
        const parser = document.createElement('a');

        parser.href = location.href;
        source = `${parser.protocol}//${parser.host}/${source}`;
    }

    // If source has no protocol, prefix it to beginning
    else if (source.substr(0, 2) === '//') {
        source = location.protocol + source;
    }

    // Sanitize source
    return sanitizeSource(source);
};

/**
 * Remove reference to mounted component.
 *
 * @param  {int}  id identifier
 * @return {void}
 */
const removeListeningComponent = id => delete mounted[id];

/**
 * Return sanitized source with deduplicated slashes
 * and alphabetical query string so we can match against
 * cache.
 *
 * @param  {string} source source
 * @return {string}        parsed source
 */
const sanitizeSource = source => {
    const matches = ['http://', 'https://', '//'];
    const index   = source.indexOf('?');
    let protocol  = '';
    let query     = '';
    let match;

    // Alphabeticalise query string
    if (index !== -1) {
        query = source.substr(index + 1);
        query = query
            .split('&')
            .sort()
            .join('&');

        source = source.substr(0, index);
    }

    // To deduplicate slashes we first need to work
    // out whether we have a full URL. If we do
    // remove protocol from source
    for (match of matches) {
        if (source.substr(0, match.length) === match) {
            source = source.substr(match.length);
            protocol = match;
            break;
        }
    }

    // Deduplicate and remove remove leading
    // and traling slashes
    source = source
        .replace(/\/+/g, '/')
        .replace(/^\/|\/$/g, '');

    // Return rebuild source
    return decodeURIComponent(protocol + source + query);
};

/**
 * Store component listening to store. We need to know what
 * components are connected to trigger the correct state
 * on transition.
 *
 * @param  {object} component react component
 * @return {int}              uuid
 */
const setListeningComponent = component => {
    mounted[uuid++] = component;
    return uuid - 1;
};

// Export module
module.exports = {
    getListeningComponents,
    getSources,
    isUrl,
    parseUrl,
    removeListeningComponent,
    sanitizeSource,
    setListeningComponent
};
