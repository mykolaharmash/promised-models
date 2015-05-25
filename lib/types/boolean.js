/**
 * Boolean attribute
 */
var Attribute = require('../attribute');
 module.exports = Attribute.inherit({
    default: false,

    /**
     * @override {Attribute}
     */
    parse: function (value) {
        return Boolean(value);
    }
});
