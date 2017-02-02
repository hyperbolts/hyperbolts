const history         = require('react-router/lib/browserHistory');
const React           = require('react');
const {render}        = require('react-dom');
const Router          = require('react-router/lib/Router');
const Store           = require('./state/Store');
const transition      = require('./state/actions/transition');
const Utilities       = require('./state/Utilities');

/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

module.exports = class {

    /**
     * On constructor, set default config.
     *
     * @return {void}
     */
    constructor() {
        const Core = this;

        // Set default config
        this.config = {
            mount:  undefined,
            routes: undefined,
            scroll: true,
            store:  undefined,

            // Function called when router updates its
            // state in response to URL changes
            routerUpdateCallback: function() {

                // Trigger transition action
                Core.store.dispatch(transition());

                // Unless we have been told not to,
                // scoll to top of window
                if (Core.config.scroll === true) {
                    window.scroll(0, 0);
                }

                // Disabling scroll should only last
                // for one transition, so re-enable
                // scrolling
                else {
                    Core.config.scroll = true;
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
        return require('./state/connect.jsx')(...args);
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
     * Set DOM element to use when mounting application.
     *
     * @param  {object} mount DOM element
     * @return {void}
     */
    set mount(mount) {
        this.config.mount = mount;
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

        // If we don't have a mount point set, use default
        if (this.config.mount === undefined) {
            this.config.mount = document.getElementById('__react_mount');
        }

        // Create element
        const element = (
            <Router history={history} onUpdate={this.config.routerUpdateCallback}>
                {this.config.routes}
            </Router>
        );

        // Render router
        render(element, this.config.mount);
    }

    /**
     * Retrieve current store instance.
     *
     * @return {object} store
     */
    get store() {

        // If store is not set, create default
        // instance
        if (this.config.store === undefined) {
            this.config.store = new Store();
        }

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
        const location = window.location;
        const path     = Utilities.sanitizeSource(location.pathname);

        return path + location.search;
    }
};
