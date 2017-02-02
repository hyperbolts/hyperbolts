const Constants         = require('../Constants');
const fetchMissingState = require('./fetchMissingState');
const Utilities         = require('../Utilities');

/**
 * HyperBolts ϟ (https://hyperbolts.io)
 *
 * Copyright © 2015-present Pace IT Systems Ltd.
 * All rights reserved.
 *
 * @author  Pace IT Systems Ltd
 * @license MIT
 */

module.exports = () => dispatch => {
    const mounted   = Utilities.getListeningComponents();
    const processed = [];
    let uuid;

    // Loop through mounted components
    for (uuid in mounted) {
        let config;

        // Skip prototyped properties
        if (Object.prototype.hasOwnProperty.call(mounted, uuid) === false) {
            continue;
        }

        // Retrieve sources
        const sources = Utilities.getSources(mounted[uuid]);

        // Loop through sources
        for (config of sources) {
            const source = Utilities.sanitizeSource(config.source);

            // Skip if we have already processed this source
            if (processed.indexOf(source) !== -1) {
                continue;
            }

            // Fetch missing state
            processed.push(source);
            dispatch(fetchMissingState(source));
        }
    }

    // If all state is cached the store will never be updated
    // and therefore all listening components won't get data.
    // Fire one last dispatch to make sure all components are
    // updated.
    dispatch({
        type: Constants.Actions.TRANSITION
    });
};
