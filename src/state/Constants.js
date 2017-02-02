/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

module.exports = {

    // Actions
    Actions: {
        ERROR_STATE:   'ERROR_STATE',
        RECEIVE_STATE: 'RECEIVE_STATE',
        REQUEST_STATE: 'REQUEST_STATE',
        RESET_STORE:   'RESET_STORE',
        TRANSITION:    'TRANSITION'
    },

    // Exceptions
    /* eslint max-len: 0 */
    Exceptions: {
        ERROR_403:            'We don\'t have access to the requested data.',
        ERROR_404:            'We couldn\'t find the data we were looking for.',
        ERROR_500:            'The server encountered an internal error. Please try refreshing or contact us if the problem persists.',
        ERROR_503:            'The server is temporarily unavailable. Please try refreshing or contact us if the problem persists.',
        ERROR_JSON_MALFORMED: 'We received broken data from the server. Please try refreshing or contact us if the problem persists.',
        ERROR_UNKNOWN:        'Something went wrong when retrieving data. Please try refreshing or contact us if the problem persists.'
    }
};
