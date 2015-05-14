/**
 * Simple model class
 */
var Models = require('../../lib/promised-models');

module.exports = Models.inherit({
    fields: {
        a: {
            type: 'string',
            default: 'a'
        }
    },
    propA: 'propA'
});
