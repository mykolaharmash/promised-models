/**
 * Model with types
 */
var Model = require('../../lib/model'),
    Attribute = require('../../lib/attribute'),
    NestedModel = Model.inherit({
        attributes: {
            id: Model.attributeTypes.Id,
            a: Model.attributeTypes.String,
            b: Model.attributeTypes.String,
            invalid: Model.attributeTypes.Number.inherit({
                getValidationError: function () {
                    return !this.value;
                }
            })
        }
    });

module.exports = Model.inherit({
    attributes: {
        nested: Model.attributeTypes.Model.inherit({
            modelType: NestedModel
        }),
        nestedCollection: Model.attributeTypes.Collection.inherit({
            modelType: NestedModel
        }),
        nestedAsync: Model.attributeTypes.Model(require('./with-calculations')),
        collection: Model.attributeTypes.ModelsList(require('./with-calculations')),
        collectionWithInvalid: Model.attributeTypes.ModelsList(NestedModel)
    }
});
