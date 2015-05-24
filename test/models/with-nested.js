/**
 * Model with types
 */
var Model = require('../../lib/model'),
    NestedModel = Model.inherit({
        fields: {
            a: Model.fields.String,
            b: Model.fields.String,
            invalid: Model.fields.Number.inherit({
                validate: function () {
                    return Boolean(this.value);
                }
            })
        }
    });

module.exports = Model.inherit({
    fields: {
        nested: Model.fields.Model.inherit({
            modelType: NestedModel
        }),
        nestedAsync: Model.fields.Model(require('./with-calculations')),
        collection: Model.fields.ModelsList(require('./with-calculations')),
        collectionWithInvalid: Model.fields.ModelsList(NestedModel)
    }
});
