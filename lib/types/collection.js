var Attribute = require('../attribute'),
    Collection = require('../collection'),
    CollectionAttribute;

/**
 * @class CollectionAttribute
 * @extends Attribute
 */
CollectionAttribute = Attribute.inherit(/** @lends CollectionAttribute.prototype */{

    /**
     * @type {?Function}
     * @constructs Model
     */
    modelType: null,

    /**
     * @type {?Function}
     * @constructs Collection
     */
    collectionType: null,

    default: null,

    __constructor: function () {
        this.__base.apply(this, arguments);

        this._initCollection();
    },

    /**
     * @override {Attribute}
     */
    isChanged: function (branch) {
        return this.value.isChanged(branch);
    },

    /**
     * @override {Attribute}
     */
    commit: function (branch) {
        var result = this.value.commit(branch);
        if (result) {
            this._emitCommit(branch);
        }
        return result;
    },

    /**
     * @override {Attribute}
     */
    revert: function (branch) {
        return this.value.revert(branch);
    },

    /**
     * @override {Attribute}
     */
    getLastCommited: function (branch) {
        return this.value.getLastCommited(branch);
    },

    /**
     * @override {Attribute}
     */
    previous: function () {
        return this.value.previous();
    },

    /**
     * @param {*} value
     * @returns {Boolean}
     */
    isEqual: function (value) {
        return value === null && this.value === null ? true :  this.__base(value);
    },

    toJSON: function () {
        return this.value.toJSON();
    },

    /**
     * @param {(Collection|Array.<(Model|Object)>)} data
     * @returns {Collection}
     */
    _toAttributeValue: function (data) {
        var CollectionClass;

        if (data instanceof Collection) {
            return data;
        } else {
            CollectionClass = this.collectionType ? this.collectionType : Collection;
            if (this.modelType) {
                CollectionClass = CollectionClass.inherit({
                    modelType: this.modelType
                });
            }
            return new CollectionClass(data);
        }
    },

    /**
     * @param {?Array.<(Model|Object)>} value
     */
    set: function (value) {
        if (this.isEqual(value)) {
            return;
        }
        if (value === null) {
            this.value.un('change add remove', this._emitChange, this);
            this.value = null;
        } else if (this.value === null) {
            this.value = this._toAttributeValue(value);
            this._initCollection();
            this._emitChange();
        } else {
            this.value.set(value);
        }
    },

    _initCollection: function () {
        this.value.on('change add remove', this._emitChange, this);
    }

});

module.exports = CollectionAttribute;
