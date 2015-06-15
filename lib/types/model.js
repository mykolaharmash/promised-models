/**
 * Nested model attribute
 */
var Attribute = require('../attribute'), ModelAttribute, ModelAttributeStatic;

/**
 * Attribute with nested model
 * @class {Attribute}
 */
ModelAttribute = Attribute.inherit({

    /**
     * @override {Attribute}
     */
    __constructor: function () {
        this.__base.apply(this, arguments);
        this._initModel();
    },

    /**
     * @override {Attribute}
     */
    isSet: function () {
        throw new Error('.isSet is not implemented for nested models');
    },

    /**
     * @override {Attribute}
     */
    unset: function () {
        throw new Error('.unset is not implemented for nested models');
    },

    /**
     * nested model ready
     * @return {Promise}
     */
    ready: function () {
        return this.value.ready();
    },

    /**
     * @override {Attribute}
     */
    validate: function () {
        return this.value.validate();
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
        return this.value.commit(branch);
    },

    /**
     * @override {Attribute}
     */
    revert: function (branch) {
        return this.value.revert(branch);
    },

    /**
     * @abstarct
     * @type {Model}
     */
    modelType: null,

    /**
     * @override {Attribute}
     */
    toJSON: function () {
        return this.value.toJSON();
    },

    /**
     * @override {Attribute}
     */
    parse: function (value) {
        if (value instanceof this.modelType) {
            return value;
        } else {
            return new this.modelType(value);
        }
    },

    _onModelChange: function () {
        this._emitChange();
    },

    /**
     * bind to model events
     */
    _initModel: function () {
        this.value.on('calculate', this._onModelChange, this);
    }

});

/**
 * Static constructor for ModelAttribute
 * @class
 */
ModelAttributeStatic = function (value) {
    if (this instanceof ModelAttributeStatic) {
        return new ModelAttribute(value);
    } else {
        return ModelAttribute.inherit({
            modelType: value
        });
    }
};
ModelAttributeStatic.inherit = ModelAttribute.inherit.bind(ModelAttribute);
module.exports = ModelAttributeStatic;
