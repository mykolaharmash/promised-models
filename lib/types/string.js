/**
 * String attribute
 */
var Attribute = require('../attribute');
 module.exports = Attribute.inherit({
    default: '',

    /**
     * @override {Attribute}
     */
    parse: function (value) {
        return String(value);
    }
});
