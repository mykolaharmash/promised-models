/**
 * Presistant model
 */
var Model = require('../../lib/model'),
    Vow = require('vow'),
    storage = [];

module.exports = Model.inherit({
    attributes: {
        id: Model.attributeTypes.Id,
        a: Model.attributeTypes.String.inherit({
            default: 'a-0'
        }),
        b: Model.attributeTypes.String.inherit({
            calculate: function () {
                var attribute = this;
                return Vow.fulfill().delay(0).then(function () {
                    return 'b-' + attribute.model.get('a').split('-')[1];
                });
            }
        })
    },
    storage: Model.Storage.inherit({
        insert: function (model) {
            return Vow.fulfill().delay(0).then(function () {
                var data = model.toJSON(),
                    id = storage.length;
                data.id = id;
                storage.push(data);
                return id;
            });
        },
        update: function (model) {
            return Vow.fulfill().delay(0).then(function () {
                storage[model.getId()] = model.toJSON();
            });
        },
        find: function (model) {
            return Vow.fulfill().delay(0).then(function () {
                var data =  storage[model.getId()];
                if (data) {
                    return data;
                } else {
                    return Vow.reject(new Error('Not found'));
                }
            });
        },
        remove: function (model) {
            return Vow.fulfill().delay(0).then(function () {
                storage[model.getId()] = null;
            });
        }
    })
}, {
    testStorage: storage
});
