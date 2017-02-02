const Constants = require('./Constants');

/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

module.exports = (state = {
    sources: {},
    errors:  []
}, action) => {

    // Set default loading flag
    let loading = false;

    // Handle action type
    switch (action.type) {

        // Request state
        case Constants.Actions.REQUEST_STATE:
            loading = true;

            // If we already have state for this source we need
            // to keep this intact, otherwise components will
            // temporarily blank while data is being refreshed
            action.state = state[action.source] || {};
            action.state = Object.assign({}, action.state);

        // Receive state
        case Constants.Actions.RECEIVE_STATE:

            // Add source, loading status and update timestamp
            action.state.source = action.source;
            action.state.updated = Date.now();
            action.state.loading = loading;
            action.state.error = false;

            // Return updated state
            return Object.assign({}, state, {

                // Merge into existing sources. We need to use a new
                // copy of the source object otherwise anything
                // referencing it will be updated.
                sources: Object.assign({}, state.sources, {
                    [action.source]: action.state
                })
            });

        // Error state
        case Constants.Actions.ERROR_STATE: {
            const source  = state.sources[action.source];
            const errors  = state.errors.slice();
            const sources = {};

            // Add error to message stack
            errors.push({
                message: action.error,
                source:  action.source
            });

            // If source exists, set error flag to true
            if (source !== undefined) {
                sources[action.source] = Object.assign({}, source, {
                    updated: Date.now(),
                    error:   true
                });
            }

            // Return updated state
            return Object.assign({}, state, {
                sources: Object.assign({}, state.sources, sources),
                errors
            });
        }

        // Reset store
        case Constants.Actions.RESET_STORE:
            return {
                sources: {},
                errors:  []
            };

        // No matching action
        default:
            return state;
    }
};
