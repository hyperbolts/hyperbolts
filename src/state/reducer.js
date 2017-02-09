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
    let loading = false;

    // Handle action type
    switch (action.type) {

        // Request state
        case Constants.Actions.REQUEST_STATE: {
            const cache = state.sources[action.source];

            // If we already have state for this source we need
            // to keep this intact, otherwise components will
            // temporarily blank while data is being refreshed
            if (cache !== undefined) {

                // Process array
                if (Array.isArray(cache.state) === true) {
                    action.state = action.state.splice();
                }

                // Process object
                else {
                    action.state = Object.assign({}, cache.state);
                }
            }

            // Set loading status
            loading = true;
        }

        // Receive state
        case Constants.Actions.RECEIVE_STATE: {

            // Nest state in a new object with source,
            // loading status and update timestamp
            const data = {
                state:   action.state || [],
                source:  action.source,
                updated: Date.now(),
                error:   false,
                loading
            };

            // Return updated state
            return Object.assign({}, state, {

                // Merge into existing sources. We need to use a new
                // copy of the source object otherwise anything
                // referencing it will be updated.
                sources: Object.assign({}, state.sources, {
                    [action.source]: data
                })
            });
        }

        // Error state
        case Constants.Actions.ADD_ERROR: {
            const source  = state.sources[action.source];
            const errors  = state.errors.slice();
            const sources = {};

            // If source exists, set error flag to true
            if (source !== undefined) {
                sources[action.source] = Object.assign({}, source, {
                    updated: Date.now(),
                    error:   true
                });
            }

            // Add error to stack
            errors.push({
                source:   action.source,
                error:    action.error,
                status:   action.status,
                response: action.response
            });

            // Return updated state
            return Object.assign({}, state, {
                sources: Object.assign({}, state.sources, sources),
                errors
            });
        }

        // Remove error
        case Constants.Actions.REMOVE_ERROR: {
            const errors = state.errors.slice();

            // Return updated state
            errors.splice(action.key, 1);
            return Object.assign({}, state, {
                errors
            });
        }

        // Remove errors
        case Constants.Actions.REMOVE_ERRORS:
            return Object.assign({}, state, {
                errors: []
            });

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
