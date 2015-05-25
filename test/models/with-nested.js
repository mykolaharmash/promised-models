/**
 * Model with types
 */
var Model = require('../../lib/model'),
    NestedModel = Model.inherit({
        attributes: {
            a: Model.attributeTypes.String,
            b: Model.attributeTypes.String,
            invalid: Model.attributeTypes.Number.inherit({
                validate: function () {
                    return Boolean(this.value);
                }
            })
        }
    });

module.exports = Model.inherit({
    attributes: {
        nested: Model.attributeTypes.Model.inherit({
            modelType: NestedModel
        }),
        nestedAsync: Model.attributeTypes.Model(require('./with-calculations')),
        collection: Model.attributeTypes.ModelsList(require('./with-calculations')),
        collectionWithInvalid: Model.attributeTypes.ModelsList(NestedModel)
    }
});
