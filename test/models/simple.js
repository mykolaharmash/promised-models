/**
 * Simple model class
 */
var Models = require('../../lib/promised-models');

module.exports = Models.inherit({
    fields: {
        a: {
            type: 'string',
            default: 'a'
        },

        b: {
            type: 'string'
        },

        c: {
            type: 'string',
            internal: true,
            default: 'c'
        },
        withValidation: {
            type: 'string',
            default: 'validValue',
            validate: function () {
                return this.value === 'validValue';
            }
        }
    },
    propA: 'propA'
});
