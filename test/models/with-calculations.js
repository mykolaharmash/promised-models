/**
 * Model with calculations
 */
var Models = require('../../lib/model'),
    Vow = require('vow');

module.exports = Models.inherit({
    attributes: {
        a: Models.attributeTypes.String.inherit({
            default: 'a-0'
        }),

        b: Models.attributeTypes.String.inherit({
            calculate: function () {
                return 'b-' + this.model.get('a').split('-')[1];
            }
        }),

        c: Models.attributeTypes.String.inherit({
            calculate: function () {
                return 'c-' + this.model.get('b').split('-')[1];
            }
        }),

        async: Models.attributeTypes.String.inherit({
            calculate: function () {
                return Vow.fulfill().delay(0).then(function () {
                    return 'async';
                });
            }
        }),

        asyncDepended: Models.attributeTypes.String.inherit({
            calculate: function () {
                var attribute = this;
                return Vow.fulfill().delay(0).then(function () {
                    var data = attribute.model.toJSON();
                    return [data.a, data.b, data.c, data.async].join('-');
                });
            }
        }),

        amendedAttribute: Models.attributeTypes.String.inherit({
            default: 'defaultValue'
        }),

        amendingAttribute: Models.attributeTypes.String.inherit({
            default: 'defaultValue',
            amend: function () {
                var attribute = this;
                return Vow.fulfill().delay(0).then(function () {
                    attribute.model.set('amendedAttribute', attribute.get());
                });
            }
        }),

        preprocessed: Models.attributeTypes.String.inherit({
            _toAttributeValue: function (value) {
                if (typeof value !== 'string') {
                    return JSON.stringify(value);
                } else {
                    return this.__base(value);
                }
            }
        })
    },
    propA: 'propA'
});
