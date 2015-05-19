/**
 * String field
 */
var Field = require('../field');
 module.exports = Field.inherit({
    default: '',

    /**
     * @override {Field}
     */
    parse: function (value) {
        return String(value);
    }
});
