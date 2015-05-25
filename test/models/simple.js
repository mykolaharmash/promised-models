/**
 * Simple model class
 */
var Models = require('../../lib/model'),
    Vow = require('vow');

module.exports = Models.inherit({
    attributes: {
        a: Models.attributeTypes.String.inherit({
            type: 'string',
            default: 'a'
        }),

        b: Models.attributeTypes.String.inherit({
            type: 'string'
        }),

        c: Models.attributeTypes.String.inherit({
            type: 'string',
            internal: true,
            default: 'c'
        }),
        withSyncValidation: Models.attributeTypes.String.inherit({
            type: 'string',
            default: 'validValue',
            validate: function () {
                return this.value === 'validValue';
            }
        }),
        withAsyncValidation: Models.attributeTypes.String.inherit({
            type: 'string',
            default: 'validValue',
            validate: function () {
                var attribute = this;
                return Vow.fulfill().delay(0).then(function () {
                    return attribute.value === 'validValue';
                });
            }
        })
    },
    propA: 'propA'
});
