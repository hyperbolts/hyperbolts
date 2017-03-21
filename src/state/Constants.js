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
        ADD_ERROR:     'ADD_ERROR',
        RECEIVE_STATE: 'RECEIVE_STATE',
        REQUEST_STATE: 'REQUEST_STATE',
        REMOVE_ERROR:  'REMOVE_ERROR',
        RESET_ERRORS:  'RESET_ERRORS',
        RESET_STORE:   'RESET_STORE',
        TRANSITION:    'TRANSITION'
    },

    // Exceptions
    Exceptions: {
        ERROR_403: 'We don\'t have access to the requested data.',
        ERROR_404: 'We couldn\'t find the data you were looking for.',

        // eslint-disable-next-line max-len
        ERROR_UNKNOWN: 'Something went wrong when retrieving data. Please try refreshing or contact us if the problem persists.'
    }
};
