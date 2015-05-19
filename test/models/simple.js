/**
 * Simple model class
 */
var Models = require('../../lib/promised-models'),
    Vow = require('vow');

module.exports = Models.inherit({
    fields: {
        a: Models.fields.String.inherit({
            type: 'string',
            default: 'a'
        }),

        b: Models.fields.String.inherit({
            type: 'string'
        }),

        c: Models.fields.String.inherit({
            type: 'string',
            internal: true,
            default: 'c'
        }),
        withSyncValidation: Models.fields.String.inherit({
            type: 'string',
            default: 'validValue',
            validate: function () {
                return this.value === 'validValue';
            }
        }),
        withAsyncValidation: Models.fields.String.inherit({
            type: 'string',
            default: 'validValue',
            validate: function () {
                var field = this;
                return Vow.fulfill().delay(0).then(function () {
                    return field.value === 'validValue';
                });
            }
        })
    },
    propA: 'propA'
});
