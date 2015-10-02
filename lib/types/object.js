/**
 * Serializeable object attribute
 */
var StringAttribute = require('./string');
 module.exports = StringAttribute.inherit({

    /**
     * @override {StringAttribute}
     */
    default: 'null',

    /**
     * @override {StringAttribute}
     */
    _fromAttributeValue: function (value) {
        return JSON.parse(value);
    },

    /**
     * @override {StringAttribute}
     */
    _toAttributeValue: function (value) {
        if (typeof value !== 'string') {
            return JSON.stringify(value);
        } else {
            return value;
        }
    }
});
