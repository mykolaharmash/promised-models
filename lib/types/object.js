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
    get: function () {
        return JSON.parse(this.value);
    },

    /**
     * @override {StringAttribute}
     */
    parse: function (value) {
        if (typeof value !== 'string') {
            return JSON.stringify(value);
        } else {
            return value;
        }
    }
});
