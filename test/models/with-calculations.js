/**
 * Model with calculations
 */
var Models = require('../../lib/promised-models'),
    Vow = require('vow');

module.exports = Models.inherit({
    fields: {
        a: {
            type: 'string',
            default: 'a-0'
        },

        b: {
            type: 'string',
            calculate: function () {
                return 'b-' + this.model.get('a').split('-')[1];
            }
        },

        c: {
            type: 'string',
            calculate: function () {
                return 'c-' + this.model.get('b').split('-')[1];
            }
        },

        async: {
            type: 'string',
            calculate: function () {
                return Vow.fulfill().delay(0).then(function () {
                    return 'async';
                });
            }
        },

        asyncDepended: {
            type: 'string',
            calculate: function () {
                var field = this;
                return Vow.fulfill().delay(0).then(function () {
                    var data = field.model.toJSON();
                    return [data.a, data.b, data.c, data.async].join('-');
                });
            }
        },

        amendedField: {
            type: 'string',
            default: 'defaultValue'
        },

        amendingField: {
            type: 'string',
            default: 'defaultValue',
            amend: function () {
                var field = this;
                return Vow.fulfill().delay(0).then(function () {
                    field.model.set('amendedField', field.get());
                });
            }
        },

        preprocessed: {
            type: 'string',
            parse: function (value) {
                if (typeof value !== 'string') {
                    return JSON.stringify(value);
                } else {
                    return this.__base(value);
                }
            }
        }
    },
    propA: 'propA'
});
