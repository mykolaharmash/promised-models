/**
 * Model with list
 */
var Model = require('../../lib/promised-models'),
    Vow = require('vow');

module.exports = Model.inherit({
    fields: {
        list: Model.fields.List
    }
});
