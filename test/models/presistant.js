/**
 * Presistant model
 */
var Model = require('../../lib/promised-models'),
    storage = [];

module.exports = Model.inherit({
    fields: {
        s: Model.fields.String.inherit({
            default: 'a-0'
        })
    },
    storage: Model.Storage.inherit({
        insert: function (model) {
            storage.push(model.toJSON());
            return storage.length - 1;
        },
        update: function (model) {
            storage[model.getId()] = model.toJSON();
        },
        find: function (model) {
            return storage[model.getId()];
        },
        remove: function (model) {
            storage.splice(model.getId(), 1);
        }
    })
});