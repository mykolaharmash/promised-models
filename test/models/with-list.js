/**
 * Model with list
 */
var Model = require('../../lib/model'),
    Vow = require('vow');

module.exports = Model.inherit({
    attributes: {
        list: Model.attributeTypes.List
    }
});
