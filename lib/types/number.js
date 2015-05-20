/**
 * Number field
 */
var Field = require('../field');
 module.exports = Field.inherit({
    default: NaN,

    /**
     * @override {Field}
     */
    parse: function (value) {
        return Number(value);
    }
});
