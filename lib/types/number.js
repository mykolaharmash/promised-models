/**
 * Number field
 */
var Field = require('../field');
 module.exports = Field.inherit({
    default: NaN,

    /**
     * @override {Field}
     */
    isEqual: function (value) {
        if (isNaN(value) && isNaN(this.value)) {
            return true;
        } else {
            return this.__base(value);
        }
    },

    /**
     * @override {Field}
     */
    parse: function (value) {
        return Number(value);
    }
});
