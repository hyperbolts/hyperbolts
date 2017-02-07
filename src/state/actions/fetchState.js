const Constants    = require('../Constants');
const Hyper        = require('../..');
const Utilities    = require('../Utilities');
const addError     = require('./addError');
const receiveState = require('./receiveState');
const requestState = require('./requestState');

/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

// Ongoing requests
const requests = {};

// Export action
module.exports = source => dispatch => {
    let errorResponse, status;

    // Skip if request is ongoing
    source = Utilities.sanitizeSource(source);
    if (requests[source] !== undefined) {
        return;
    }

    // Parse identifier to add to source
    const identifier = source.indexOf('?') === -1 ? '?hyper' : '&hyper';

    // Fetch source
    dispatch(requestState(source));
    requests[source] = fetch(source + identifier, {
        credentials: 'include'
    })

        // Check for redirection
        .then(response => {
            ({status} = response.status);
            let {url} = response;

            // Remove from ongoing requests
            delete requests[source];

            // If response URL is an empty string, attempt to retrieve
            // from headers. This is needed for browsers polyfilling
            // fetch due to XHR limitations.
            if (url === '') {
                url = response.headers.get('X-Request-URL');

                // If we haven't been able to retrieve a URL from headers
                // we can't determine whether the source has redirected.
                // Rather than fall over, assume request completed
                // successfully (most likely outcome).
                if (url === null) {
                    return response;
                }
            }

            // Remove identifier from source
            url = url.substr(0, url.length - 6);

            // If source and response do not match, we must have
            // been redirected. Change the window location to
            // the response location.
            if (Utilities.parseUrl(url) !== Utilities.parseUrl(source)) {
                Hyper.store.stateRedirectCallback(url, response);
                throw new Error('redirect');
            }

            return response;
        })

        // Attempt to parse body
        .then(response => response.json())

        // Check data then pass to store
        .then(state => {

            // If state is an array, wrap in
            // an object so data stays loopable
            // after store adds additional keys
            if (Array.isArray(state) === true) {
                state = {
                    values: state
                };
            }

            // If status is not 200, store returned error data
            // and trigger exception
            if (status !== 200) {
                errorResponse = state;
                throw new Error('invalid');
            }

            // Pass to store
            dispatch(receiveState(source, state));
        })

        // Catch any errors
        .catch(err => {
            let error = Constants.Exceptions.ERROR_UNKNOWN;

            // If we are processing a redirect, this is
            // expected and not an error
            if (err.message === 'redirect') {
                return;
            }

            // If status is not 200, attempt to find exact error
            if (status !== 200) {
                if (Constants.Exceptions[`ERROR_${status}`] !== undefined) {
                    error = Constants.Exceptions[`ERROR_${status}`];
                }
            }

            // Handle malformed JSON
            else if (err.message.indexOf('JSON') !== -1) {
                error = Constants.Exceptions.ERROR_JSON_MALFORMED;
            }

            // Pass error to store
            return dispatch(addError(source, error, status, errorResponse));
        });
};
