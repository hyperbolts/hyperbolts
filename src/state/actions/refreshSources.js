const fetchListeningSources = require('./fetchListeningSources');
const removeState           = require('./removeState');
const Utilities             = require('../Utilities');

/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

module.exports = () => (dispatch, getState) => {
    const listening = Utilities.getListeningSources();
    const {sources} = getState();
    let source;

    // Start by fetching listening sources, forcing
    // them to refresh if already cached
    dispatch(fetchListeningSources(true));

    // Loop through cache
    for (source in sources) {

        // Skip prototyped properties
        if (Object.prototype.hasOwnProperty.call(sources, source) === false) {
            continue;
        }

        // If source is currently being listened for,
        // do not remove from store
        if (listening.indexOf(source) !== -1) {
            continue;
        }

        // Dispatch action
        dispatch(removeState(source));
    }
};
