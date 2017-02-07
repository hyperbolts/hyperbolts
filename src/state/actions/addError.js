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

module.exports = (source, error, status, response) => ({
    type:   Constants.Actions.ADD_ERROR,
    source: Utilities.sanitizeSource(source),
    error,
    status,
    response
});
