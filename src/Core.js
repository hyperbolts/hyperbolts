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
        const that = this;

        // Set default config
        this.config = {
            mount:  undefined,
            routes: undefined,
            scroll: true,
            store:  undefined,

            // Function called when router updates its
            // state in response to URL changes
            routerUpdateCallback() {

                // Trigger transition action
                that.store.dispatch(transition());

                // Unless we have been told not to,
                // scoll to top of window
                if (that.config.scroll === true) {
                    window.scroll(0, 0);
                }

                // Disabling scroll should only last
                // for one transition, so re-enable
                // scrolling
                else {
                    that.config.scroll = true;
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
    connect(...args) { // eslint-disable-line class-methods-use-this
        return require('./state/connect')(...args); // eslint-disable-line global-require
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
        const element = React.createElement(Router, {
            onUpdate: this.config.routerUpdateCallback,
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
    set title(title) { // eslint-disable-line class-methods-use-this
        document.title = title;
    }

    /**
     * Get current URI.
     *
     * @return {string} URI
     */
    get uri() { // eslint-disable-line class-methods-use-this
        const {location} = window;
        const path       = Utilities.sanitizeSource(location.pathname);

        return path + location.search;
    }
};
