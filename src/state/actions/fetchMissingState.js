const fetchState = require('./fetchState');
const Utilities  = require('../Utilities');

/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

module.exports = source => (dispatch, getState) => {
    source = Utilities.sanitizeSource(source);

    // If state is not already cached, fetch source
    if (getState().sources[source] === undefined) {
        return dispatch(fetchState(source));
    }
};
