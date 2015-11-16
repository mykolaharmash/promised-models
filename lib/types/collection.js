var Attribute = require('../attribute'),
    Collection = require('../collection'),
    Vow = require('vow'),
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

    validate: function () {
        return Vow.allResolved(this.value.map(function (model) {
            return model.validate();
        })).then(function (validationPromises) {
            var modelsErrors = [],
                error;

            validationPromises.forEach(function (promise, index) {
                var error;
                if (promise.isRejected()) {
                    error = promise.valueOf();
                    error.index = index;
                    modelsErrors.push(error);
                }
            });

            if (modelsErrors.length) {
                error = new CollectionAttribute.ValidationError();
                error.modelsErrors = modelsErrors;
                return Vow.reject(error);
            } else {
                return true;
            }

        }.bind(this));
    },

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

}, {

    ValidationError: (function () {

        /**
         * @param {String} message
         */
        var ValidationError = function (message) {
            Attribute.ValidationError.call(this, message);
            this.name = 'CollectionAttributeValidationError';
        };
        ValidationError.prototype = Object.create(Attribute.ValidationError.prototype);
        ValidationError.constructor = ValidationError;
        return ValidationError;
    })()
});

module.exports = CollectionAttribute;
