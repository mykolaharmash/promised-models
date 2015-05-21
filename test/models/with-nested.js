/**
 * Model with types
 */
var Model = require('../../lib/promised-models'),
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
        nestedAsync: Model.fields.Model.inherit({
            modelType: require('./with-calculations')
        })
    }
});
