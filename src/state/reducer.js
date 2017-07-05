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
        case Constants.Actions.REQUEST_STATE:
            const cache = state.sources[action.source] || {};

            // If we already have loaded data, dont update
            // state. This prevents flickering when refreshing
            // data that is already on screen.
            if (cache.loading === false) {
                return state;
            }

            action.state = [];
            loading = true;

        // Receive state
        case Constants.Actions.RECEIVE_STATE:
            return Object.assign({}, state, {

                // Merge into existing sources. We need to use a new
                // copy of the source object otherwise anything
                // referencing it will be updated.
                sources: Object.assign({}, state.sources, {
                    [action.source]: {
                        state:   action.state,
                        source:  action.source,
                        updated: Date.now(),
                        error:   false,
                        loading
                    }
                })
            });

        // Remove state
        case Constants.Actions.REMOVE_STATE:
            const sources = Object.assign({}, state.sources);

            // Remove source and return updated state
            delete sources[action.source];
            return Object.assign({}, state, {
                sources
            });

        // Error state
        case Constants.Actions.ADD_ERROR: {
            let {sources} = state;
            const source  = sources[action.source];

            // If source exists, rebuild sources
            // with error flag set to true
            if (source !== undefined) {
                sources = Object.assign({}, sources, {
                    [action.source]: Object.assign({}, source, {
                        updated: Date.now(),
                        error:   true
                    })
                });
            }

            // Return updated state
            return Object.assign({}, state, {
                sources,
                errors: [
                    ...state.errors,
                    {
                        source:   action.source,
                        error:    action.error,
                        status:   action.status,
                        response: action.response
                    }
                ]
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

        // Reset errors
        case Constants.Actions.RESET_ERRORS:
            return Object.assign({}, state, {
                errors: []
            });

        // Reset store
        case Constants.Actions.RESET_STORE:
            return Object.assign({}, state, {
                sources: {},
                errors:  []
            });

        // No matching action
        default:
            return state;
    }
};
