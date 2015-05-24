/**
 * Model with calculations
 */
var Models = require('../../lib/model'),
    Vow = require('vow');

module.exports = Models.inherit({
    fields: {
        a: Models.fields.String.inherit({
            default: 'a-0'
        }),

        b: Models.fields.String.inherit({
            calculate: function () {
                return 'b-' + this.model.get('a').split('-')[1];
            }
        }),

        c: Models.fields.String.inherit({
            calculate: function () {
                return 'c-' + this.model.get('b').split('-')[1];
            }
        }),

        async: Models.fields.String.inherit({
            calculate: function () {
                return Vow.fulfill().delay(0).then(function () {
                    return 'async';
                });
            }
        }),

        asyncDepended: Models.fields.String.inherit({
            calculate: function () {
                var field = this;
                return Vow.fulfill().delay(0).then(function () {
                    var data = field.model.toJSON();
                    return [data.a, data.b, data.c, data.async].join('-');
                });
            }
        }),

        amendedField: Models.fields.String.inherit({
            default: 'defaultValue'
        }),

        amendingField: Models.fields.String.inherit({
            default: 'defaultValue',
            amend: function () {
                var field = this;
                return Vow.fulfill().delay(0).then(function () {
                    field.model.set('amendedField', field.get());
                });
            }
        }),

        preprocessed: Models.fields.String.inherit({
            parse: function (value) {
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
