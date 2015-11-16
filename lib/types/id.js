/**
 * Number attribute
 */
var Attribute = require('../attribute');

module.exports = Attribute.inherit({

    default: null,

    isId: true,

    dataType: Number,

    /**
     * @param {*} value
     * @returns {*}
     */
    _toAttributeValue: function (value) {
        return value !== null ? this.dataType(value) : null;
    }
});
