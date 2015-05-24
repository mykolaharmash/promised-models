/**
 * Model with list
 */
var Model = require('../../lib/model'),
    Vow = require('vow');

module.exports = Model.inherit({
    fields: {
        list: Model.fields.List
    }
});
