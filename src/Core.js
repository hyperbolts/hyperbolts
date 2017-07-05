const React                 = require('react');
const Router                = require('react-router/lib/Router');
const RouterContext         = require('react-router/lib/RouterContext');
const Store                 = require('./state/Store');
const Utilities             = require('./state/Utilities');
const connect               = require('./state/connect');
const fetchListeningSources = require('./state/actions/fetchListeningSources');
const history               = require('react-router/lib/browserHistory');
const {render}              = require('react-dom');

/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

module.exports = class Core {

    /**
     * On constructor, set default config.
     *
     * @return {void}
     */
    constructor() {
        this.config = {
            mount:       document.getElementById('__react_mount'),
            routeParams: {},
            routeQuery:  {},
            scroll:      true,
            store:       new Store(),

            // Function called when router updates its
            // state in response to URL changes
            routerUpdateCallback: () => {
                this.store.dispatch(fetchListeningSources());

                // Unless we have been told not to,
                // scoll to top of window
                if (this.config.scroll === true) {
                    window.scroll(0, 0);
                }

                // Disabling scroll should only last
                // for one transition, so re-enable
                // scrolling
                else {
                    this.config.scroll = true;
                }
            }
        };
    }

    /**
     * Connect component to store.
     *
     * @param  {...array} args args
     * @return {object}        component
     */
    connect(...args) {
        return connect(...args);
    }

    /**
     * Disable scroll on next transition.
     *
     * @return {void}
     */
    disableScroll() {
        this.config.scroll = false;
    }

    /**
     * Register one or more mixins, extending the
     * current instance with prototyped properties.
     * Note this allows for a multi-inheritance pattern,
     * rather than the usual class extends syntax.
     *
     * @param  {...object} mixins mixins
     * @return {void}
     */
    register(...mixins) {
        let mixin;

        // Loop through mixins and merge into core
        for (mixin of mixins) {
            let obj;

            // Loop through object and prototypes
            for (obj of [mixin, mixin.prototype]) {
                const skip = ['bootstrap', 'constructor', 'length', 'name', 'prototype'];
                const keys = Reflect.ownKeys(obj);
                let key;

                // Loop through keys
                for (key of keys) {

                    // Skip blacklisted keys
                    if (skip.indexOf(key) !== -1) {
                        continue;
                    }

                    // Merge into target
                    Object.defineProperty(
                        Core.prototype,
                        key,
                        Object.getOwnPropertyDescriptor(obj, key)
                    );
                }

                // Run bootstrap method
                if (obj.bootstrap !== undefined) {
                    obj.bootstrap.call(this);
                }
            }
        }
    }

    /**
     * Set DOM element to use when mounting application.
     *
     * @param  {object} mount DOM element
     * @return {void}
     */
    set mount(mount) {
        this.config.mount = mount;
    }

    /**
     * Get route params.
     *
     * @return {object} route params
     */
    get routeParams() {
        return this.config.routeParams;
    }

    /**
     * Get route query.
     *
     * @return {object} route query
     */
    get routeQuery() {
        return this.config.routeQuery;
    }

    /**
     * Set callback to run when route has changed.
     *
     * @param  {func} callback callback
     * @return {void}
     */
    set routerUpdateCallback(callback) {
        this.config.routerUpdateCallback = callback;
    }

    /**
     * Set routes to use in application.
     *
     * @param  {object} routes routes
     * @return {void}
     */
    set routes(routes) {
        this.config.routes = routes;
    }

    /**
     * Mount at configured DOM element and run router.
     *
     * @return {void}
     */
    run() {
        const element = React.createElement(Router, {
            onUpdate: this.config.routerUpdateCallback,
            render:   props => {
                this.config.routeQuery = props.location.query;
                this.config.routeParams = props.params;

                // Render route
                return React.createElement(RouterContext, props);
            },
            history
        }, this.config.routes);

        // Render router
        render(element, this.config.mount);
    }

    /**
     * Retrieve current store instance.
     *
     * @return {object} store
     */
    get store() {
        return this.config.store;
    }

    /**
     * Set store instance.
     *
     * @param  {object} store store
     * @return {void}
     */
    set store(store) {
        this.config.store = store;
    }

    /**
     * Set application title.
     *
     * @param  {string} title title
     */
    set title(title) {
        document.title = title;
    }

    /**
     * Get current URI.
     *
     * @return {string} URI
     */
    get uri() {
        const {location} = window;
        const path       = Utilities.sanitizeSource(location.pathname);

        return path + location.search;
    }
};
