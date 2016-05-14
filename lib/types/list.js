/**
 * List attribute
 */
var Attribute = require('../attribute'),
    List = require('../list');
 module.exports = Attribute.inherit({
    /**
     * @override {Attribute}
     */
    default: [],

    /**
     * @override {Attribute}
     */
    toJSON: function () {
        return this.get().toArray();
    },

    /**
     * @override {Attribute}
     */
    get: function () {
        return (new List(this));
    },

    /**
     * @override {Attribute}
     */
    isEqual: function (value) {
        if (value instanceof List) {
            return value.isEqual(this.value);
        } else {
            return this.value === value;
        }
    },

    /**
     * @override {Attribute}
     */
    _toAttributeValue: function (value) {
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
        var attribute = this;
        return Object.keys(attribute._cachBranches).some(function (branch) {
            return value === attribute._cachBranches[branch];
        });
    },

    /**
     * notify that saved array changed
     */
    emitListChange: function () {
        this._emitChange();
    }
});
