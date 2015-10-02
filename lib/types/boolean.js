/**
 * Boolean attribute
 */
var Attribute = require('../attribute');
 module.exports = Attribute.inherit({
    default: false,

    /**
     * @override {Attribute}
     */
    _toAttributeValue: function (value) {
        return Boolean(value);
    }
});
