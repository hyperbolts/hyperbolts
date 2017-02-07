const fetchMissingState = require('./actions/fetchMissingState');
const fetchState        = require('./actions/fetchState');
const Redux             = require('redux');
const receiveState      = require('./actions/receiveState');
const reducer           = require('./reducer');
const Thunk             = require('redux-thunk');
const Utilities         = require('./Utilities');

/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

// Export module
module.exports = class {

    /**
     * On construct, set default config.
     *
     * @return {void}
     */
    constructor() {
        this.config = {
            stateRedirectCallback: url => {
                window.location.href = url;
            }
        };
    }

    /**
     * Dispatch an action.
     *
     * @param  {object|func} action action
     * @return {object|func}        action
     */
    dispatch(action) {
        return this.store.dispatch(action);
    }

    /**
     * Return cached state to component. Cache will generally only
     * be available if we are preloading or have rendered a component
     * using the state previously.
     *
     * @param  {string} source source
     * @return {object}        state
     */
    getCachedState(source) {
        let cache = this.store.getState().sources[
            Utilities.sanitizeSource(source)
        ];

        // Clone data
        if (cache !== undefined) {
            cache = JSON.parse(JSON.stringify(cache));
        }

        // Return cache
        return cache;
    }

    /**
     * Get redirect handler.
     *
     * @return {func} callback
     */
    get stateRedirectCallback() {
        return this.config.stateRedirectCallback;
    }

    /**
     * Set redirect handler.
     *
     * @param  {func} callback callback
     * @return {void}
     */
    set stateRedirectCallback(callback) {
        this.config.stateRedirectCallback = callback;
    }

    /**
     * Return redux store instance.
     *
     * @return {object} store
     */
    get store() {

        // If we have yet to use the redux store,
        // create instance
        if (this.redux === undefined) {
            this.redux = Redux.createStore(
                reducer, Redux.applyMiddleware(Thunk.default)
            );
        }

        return this.redux;
    }

    /**
     * Preload state for the passed source(s). Supporting
     * passing single source or array of sources.
     *
     * @param  {string|array} sources sources
     * @param  {bool}         force   reload state, even if cached
     * @return {void}
     */
    loadState(sources, force) {
        const action = force === true ? fetchState : fetchMissingState;
        let source;

        // Loop through sources and retrieve
        sources = [].concat(sources);
        for (source of sources) {
            this.store.dispatch(action(source));
        }
    }

    /**
     * Update store with source state. Can pass keyed object or
     * source and state seperately.
     *
     * @param  {string|object} sources sources
     * @param  {object}        state   state (used when sources is string)
     * @return {void}
     */
    setState(sources, state) {
        let source;

        // If we have been passed two arguments, transform into
        // state object
        if (state !== undefined) {
            sources = {
                [sources]: state
            };
        }

        // Loop through state
        for (source in sources) {

            // Skip prototyped properties
            if (Object.prototype.hasOwnProperty.call(sources, source) === false) {
                continue;
            }

            // Dispatch action
            this.store.dispatch(receiveState(source, sources[source]));
        }
    }

    /**
     * Listen to store for state changes.
     *
     * @param  {func} listener callback to run on state change
     * @return {func}          unsubscribe event
     */
    subscribe(listener) {
        return this.store.subscribe(listener);
    }
};
