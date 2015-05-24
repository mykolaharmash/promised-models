/**
 * List field
 */
var Field = require('../field'),
    List = require('../list');
 module.exports = Field.inherit({
    /**
     * @override {Field}
     */
    default: [],

    /**
     * @override {Field}
     */
    toJSON: function () {
        return this.get().toArray();
    },

    /**
     * @override {Field}
     */
    get: function () {
        return (new List(this));
    },

    /**
     * @override {Field}
     */
    isEqual: function (value) {
        if (value instanceof List) {
            return value.isEqual(this.value);
        } else {
            return this.value === value;
        }
    },

    /**
     * @override {Field}
     */
    parse: function (value) {
        if (value instanceof List) {
            return value.toArray();
        } else {
            return [].concat(value);
        }
    },

    /**
     * is given array saved in branches
     * @param  {Array}  value
     * @return {Boolean}
     */
    isListCashed: function (value) {
        var field = this;
        return Object.keys(field._cachBranches).some(function (branch) {
            return value === field._cachBranches[branch];
        });
    },

    /**
     * notify that saved array changed
     */
    emitListChange: function () {
        this._emitChange();
    }
});
