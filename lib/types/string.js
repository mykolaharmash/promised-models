/**
 * String attribute
 */
var Attribute = require('../attribute');
 module.exports = Attribute.inherit({
    default: '',

    /**
     * @override {Attribute}
     */
    _toAttributeValue: function (value) {
        return String(value);
    }
});
