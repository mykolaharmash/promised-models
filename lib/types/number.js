/**
 * Number attribute
 */
var Attribute = require('../attribute');
 module.exports = Attribute.inherit({
    default: NaN,

    /**
     * @override {Attribute}
     */
    isEqual: function (value) {
        if (isNaN(value) && isNaN(this.value)) {
            return true;
        } else {
            return this.__base(value);
        }
    },

    /**
     * @override {Attribute}
     */
    parse: function (value) {
        return Number(value);
    }
});
