/**
 * Simple model class
 */
var Models = require('../../lib/model'),
    Attribute = require('../../lib/attribute'),
    Vow = require('vow'),
    fulfill = require('../../lib/fulfill');

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
            getValidationError: function () {
                return this.value !== 'validValue';
            }
        }),
        withSyncValidationMessage: Models.attributeTypes.String.inherit({
            type: 'string',
            default: 'validValue',
            getValidationError: function () {
                return this.value !== 'validValue' && 'invalid';
            }
        }),
        withSyncValidationData: Models.attributeTypes.String.inherit({
            type: 'string',
            default: 'validValue',
            getValidationError: function () {
                return this.value !== 'validValue' && {data: 'data'};
            }
        }),
        withAsyncValidation: Models.attributeTypes.String.inherit({
            type: 'string',
            default: 'validValue',
            validate: function () {
                return fulfill().delay(0).then(function () {
                    if (this.value !== 'validValue') {
                        return Vow.reject('Invalid');
                    }
                }.bind(this));
            }
        })
    },
    propA: 'propA'
});
