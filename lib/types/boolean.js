/**
 * Boolean field
 */
var Field = require('../field');
 module.exports = Field.inherit({
    default: false,

    /**
     * @override {Field}
     */
    parse: function (value) {
        return Boolean(value);
    }
});
