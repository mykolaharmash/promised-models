/**
 * Simple model class
 */
var Models = require('../../lib/promised-models'),
    Vow = require('vow');

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
        withSyncValidation: {
            type: 'string',
            default: 'validValue',
            validate: function () {
                return this.value === 'validValue';
            }
        },
        withAsyncValidation: {
            type: 'string',
            default: 'validValue',
            validate: function () {
                var field = this;
                return Vow.fulfill().delay(0).then(function () {
                    return field.value === 'validValue';
                });
            }
        }
    },
    propA: 'propA'
});
