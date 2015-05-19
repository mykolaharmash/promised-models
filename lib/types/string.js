/**
 * String field
 */
module.exports = {
    default: '',

    /**
     * @override {Field}
     */
    parse: function (value) {
        return String(value);
    }
};
