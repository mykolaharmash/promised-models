/**
 * Number attribute
 */
var Attribute = require('../attribute');
 module.exports = Attribute.inherit({

    default: NaN,

    /**
     * work around with Infinity
     * @override
     */
    toJSON: function () {
        var value = this.__base.apply(this, arguments);
        if ((value === Infinity) || (value === -Infinity)) {
            return String(value);
        } else {
            return value;
        }
    },

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
    toAttributeValue: function (value) {
        if (value === null) {
            return NaN;
        }
        return Number(value);
    }
});
