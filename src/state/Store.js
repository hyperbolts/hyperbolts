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
     * On construct, pass redux store to use or create
     * a new one.
     *
     * @param  {object} store store
     * @return {void}
     */
    constructor(store) {
        this.store = store || Redux.createStore(
            reducer, Redux.applyMiddleware(Thunk.default)
        );
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
        source = Utilities.sanitizeSource(source);
        return this.store.getState().sources[source];
    }

    /**
     * Return redux store instance.
     *
     * @return {object} store
     */
    getStore() {
        return this.store;
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
        let action, source;

        // Parse action
        if (force === true) {
            action = fetchState;
        }
        else {
            action = fetchMissingState;
        }

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
