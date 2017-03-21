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
    const Hyper    = require('..');
    const props    = component.props || {};
    const location = props.location || {};
    const params   = props.params || {};
    const query    = location.query || {};

    // Return parsed sources
    const sources = parseSources(
        component,
        component.getSources(
            Hyper.uri,
            params,
            query,
            component.props,
            component.instance
        )
    );

    // Loop through sources, replacing params,
    // adding query string and running source
    // transformer
    return sources.map(config => {
        let key;

        // Replace params in source
        for (key in params) {
            if (Object.prototype.hasOwnProperty.call(params, key) === false) {
                continue;
            }

            // Replace param
            config.source = config.source.replace(`:${key}`, params[key]);
        }

        // Add query string
        if (config.query === true) {
            const queries = [];

            // Loop through queries
            for (key in query) {
                if (Object.prototype.hasOwnProperty.call(query, key) === false) {
                    continue;
                }

                // Add to queries array
                queries.push(`${key}=${query[key]}`);
            }

            // If we have some queries, add to source
            if (queries.length !== 0) {
                config.source += config.source.indexOf('?') === -1 ? '?' : '&';
                config.source += queries.join('&');
            }
        }

        // Run through source transformer and return
        return Hyper.store.sourceTransformer(
            config,
            Hyper.uri,
            params,
            query,
            component.props,
            component.instance
        );
    });
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
 * Return parsed sources, converting any dependent
 * sources into real sources or removing them from
 * the array.
 *
 * @param  {object} component component
 * @param  {array}  sources   sources
 * @param  {array}  original  original sources
 * @return {array}            sources
 */
const parseSources = (component, sources, original = []) => {
    const Hyper    = require('..');
    const Store    = Hyper.store;
    let additional = [];

    // If sources is a string or object, wrap in an array
    if (typeof sources === 'string' || sources.source !== undefined) {
        sources = [sources];
    }

    // Make sure all array values are source objects
    sources = sources.map(config => {
        if (typeof config === 'string') {
            return {
                source: config
            };
        }

        return config;
    });

    // Filter sources
    const filtered = sources.filter(config => {
        const data = [];
        let required;

        // If we aren't processing a dependant data source, include
        // in filtered array
        if (config.requires === undefined && config.require === undefined) {
            return true;
        }

        // Make sure requirements are an array
        const requires = [].concat(config.requires || config.require);

        // Attempt to retrieve dependant data
        for (required of requires) {
            const match = sources
                .concat(original, additional)
                .find(source => {

                    // If required is null, we should be searching
                    // for a source with no key
                    if (required === null) {
                        return source.key === undefined;
                    }

                    return source.key === required;
                });

            // If we don't have a source, don't include in filtered array
            if (match === undefined) {
                return false;
            }

            // Retrieve cache from store
            const cache = Store.getCachedState(match.source);

            // If we have no valid cache, don't include in filtered array
            if (cache === undefined || cache.loading === true || cache.error === true) {
                return false;
            }

            // Transform data
            if (match.transform !== undefined) {
                cache.state = match.transform(
                    cache.state,
                    key => component.getData(sources.concat(original, additional), key),
                    component.props,
                    component.instance
                );
            }

            data.push(cache.state);
        }

        // Retrieve parsed sources
        const parsed = parseSources(
            component,
            (config.sources || config.source)(...data, component.instance),
            sources.concat(original, additional)
        );

        // Add to parsed sources and remove from
        // filtered array
        additional = additional.concat(parsed);
        return false;
    });

    // If we have no additional sources, just return
    // base array
    if (additional.length === 0) {
        return filtered;
    }

    // Make sure all additional sources are loaded
    // then return merged sources
    Store.loadState(additional.map(config => config.source));
    return filtered.concat(additional);
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
        query = `?${query}`;
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
    parseSources,
    parseUrl,
    removeListeningComponent,
    sanitizeSource,
    setListeningComponent
};
