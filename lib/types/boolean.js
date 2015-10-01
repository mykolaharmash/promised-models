/**
 * Boolean attribute
 */
var Attribute = require('../attribute');
 module.exports = Attribute.inherit({
    default: false,

    /**
     * @override {Attribute}
     */
    toAttributeValue: function (value) {
        return Boolean(value);
    }
});
