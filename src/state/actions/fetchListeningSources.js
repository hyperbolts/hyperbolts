const Constants = require('../Constants');
const Utilities = require('../Utilities');

/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

module.exports = (force = false) => dispatch => {
    const Hyper   = require('../..');
    const Store   = Hyper.store;

    // Trigger load of listening sources
    Store.loadState(
        Utilities.getListeningSources(),
        force
    );

    // If all state is cached the store will never be updated
    // and therefore all listening components won't get data.
    // Fire one last dispatch to make sure all components are
    // updated.
    dispatch({
        type: null
    });
};
