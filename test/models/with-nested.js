/**
 * Model with types
 */
var Model = require('../../lib/promised-models'),
    NestedModel = Model.inherit({
        fields: {
            a: Model.fields.String,
            b: Model.fields.String
        }
    });

module.exports = Model.inherit({
    fields: {
        nested: Model.fields.Model.inherit({
            modelType: NestedModel
        })
    }
});
