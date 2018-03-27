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
    const mounted = Utilities.getListeningComponents();
    const Hyper   = require('../..');
    const sources = [];
    let uuid;

    // Loop through mounted components
    for (uuid in mounted) {
        let config;

        // Skip prototyped properties
        if (Object.prototype.hasOwnProperty.call(mounted, uuid) === false) {
            continue;
        }

        // Loop through sources
        for (config of Utilities.getSources(mounted[uuid])) {
            const source = Utilities.sanitizeSource(config.source);

            // Skip if we have already stored this source
            if (sources.includes(source) === true) {
                continue;
            }

            // Add to sources
            sources.push(source);
        }
    }

    // Trigger load of sources
    Hyper.store.loadState(sources, force);

    // If all state is cached the store will never be updated
    // and therefore all listening components won't get data.
    // Fire one last dispatch to make sure all components are
    // updated.
    dispatch({
        type: Constants.Actions.TRANSITION
    });
};
