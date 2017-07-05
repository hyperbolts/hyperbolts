const Constants  = require('../Constants');
const transition = require('./transition');

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

    // Start by firing transition with the force
    // flag so all data gets refreshed
    dispatch(transition(true));
};
