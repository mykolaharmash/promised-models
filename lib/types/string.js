/**
 * String attribute
 */
var Attribute = require('../attribute');
 module.exports = Attribute.inherit({
    default: '',

    /**
     * @override {Attribute}
     */
    toAttributeValue: function (value) {
        return String(value);
    }
});
