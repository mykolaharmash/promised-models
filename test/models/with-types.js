/**
 * Model with types
 */
var Model = require('../../lib/model'),
    Vow = require('vow');

module.exports = Model.inherit({
    attributes: {
        string: Model.attributeTypes.String,
        number: Model.attributeTypes.Number,
        boolean: Model.attributeTypes.Boolean
    }
});
