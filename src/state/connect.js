const fetchState = require('./actions/fetchState');
const Hyper      = require('..');
const React      = require('react');
const Utilities  = require('./Utilities');

/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

module.exports = (sources, Component) => {

    // If component is blank, assume we havn't
    // passed a source
    if (Component === undefined) {
        Component = sources;
        sources   = undefined; // eslint-disable-line no-multi-spaces
    }

    // Return higher order component
    return class extends React.Component {

        // Before component mounts, trigger any static sources.
        // This allows us to skip the extra blank render
        // required when we are getting sources from
        // the main component.
        componentWillMount() {
            this.state = {};

            // Skip if we don't have static sources
            if (sources === undefined) {
                return;
            }

            // Parse sources
            const parsed = Utilities.getSources(this);
            const Store  = Hyper.store;

            // Fetch sources then update state
            Store.loadState(parsed.map(config => config.source));
            this.updateState(parsed);
        }

        // On unmount, unsubscribe from store and cleanup
        // any refresh intervals
        componentWillUnmount() {
            let interval;

            Utilities.removeListeningComponent(this.uuid);
            this.unsubscribe();

            // Loop through refresh intervals
            for (interval of this.intervals) {
                clearInterval(interval);
            }
        }

        // Handle mount callback of main component
        handleMount(instance) {
            let config;

            // Skip if we already have instance reference
            if (this.instance !== undefined) {
                return;
            }

            this.instance = instance;

            // Set variables
            const callback = this.handleStoreUpdate.bind(this);
            const parsed   = Utilities.getSources(this);
            const Store    = Hyper.store;
            const load     = [];

            // Subscribe to store
            this.unsubscribe = Store.subscribe(callback);
            this.uuid = Utilities.setListeningComponent(this);
            this.intervals = [];

            // Loop through sources
            for (config of parsed) {
                const {source} = config;

                // Add source to array to load
                load.push(source);

                // Skip if not refreshing
                if (config.refresh === undefined) {
                    continue;
                }

                // Create refresh interval
                this.intervals.push(
                    setInterval(() => Store.dispatch(fetchState(source)), config * 1000)
                );
            }

            // Load state
            Store.loadState(load);
        }

        // Return sources
        getSources(...args) {
            const {instance} = this;

            // If available, use passed sources
            if (sources !== undefined) {
                return sources;
            }

            // Check for get sources function
            if (instance.getSources !== undefined) {
                return instance.getSources(...args);
            }

            // Check for get source function
            if (instance.getSource !== undefined) {
                return instance.getSource(...args);
            }

            // Use current URI
            return Hyper.uri;
        }

        // Handle store update
        handleStoreUpdate() {
            const parsed = Utilities.getSources(this);
            const Store  = Hyper.store;
            let config;

            // Loop and check we have the latest state from each source
            for (config of parsed) {
                const cache = Store.getCachedState(config.source);
                let state   = this.state || {};

                // Skip if we have no cache
                if (cache === undefined) {
                    continue;
                }

                // If source has a key we should actually be checking an
                // object inside of state
                if (config.key !== undefined) {
                    state = state[config.key] || {};
                }

                // If update times don't match, trigger state update
                if (cache.updated !== state.updated) {
                    this.updateState(parsed);
                    return;
                }
            }
        }

        // Update state
        updateState(parsed) {
            const Store = Hyper.store;
            let state = {};
            let config;

            // Loop through parsed sources and query store
            for (config of parsed) {
                const cache = Store.getCachedState(config.source);

                // If we have no key, use as root state
                if (config.key === undefined) {
                    state = cache;
                }

                // Add as keyed data
                else {
                    state[config.key] = cache;
                }
            }

            // Clone data and update state
            this.setState(
                JSON.parse(
                    JSON.stringify(state)
                )
            );
        }

        // Render component
        render() {
            return React.createElement(Component, Object.assign({
                ref:  this.handleMount.bind(this),
                data: this.state
            }, this.props));
        }
    };
};
