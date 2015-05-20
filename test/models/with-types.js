/**
 * Model with types
 */
var Model = require('../../lib/promised-models'),
    Vow = require('vow');

module.exports = Model.inherit({
    fields: {
        string: Model.fields.String,
        number: Model.fields.Number,
        boolean: Model.fields.Boolean
    }
});
