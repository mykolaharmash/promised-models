/**
 * Nested model field
 */
var Field = require('../field');

module.exports = Field.inherit({

    /**
     * @override {Field}
     */
    __constructor: function () {
        this.__base.apply(this, arguments);
        this._initModel();
    },

    /**
     * nested model ready
     * @return {Promise}
     */
    ready: function () {
        return this.value.ready();
    },

    /**
     * @override {Field}
     */
    validate: function () {
        return this.value.validate();
    },

    /**
     * @override {Field}
     */
    isChanged: function (branch) {
        return this.value.isChanged(branch);
    },

    /**
     * @override {Field}
     */
    commit: function (branch) {
        return this.value.commit(branch);
    },

    /**
     * @override {Field}
     */
    revert: function (branch) {
        return this.value.commit(branch);
    },

    /**
     * @abstarct
     * @type {Model}
     */
    modelType: null,

    /**
     * @override {Field}
     */
    toJSON: function () {
        return this.value.toJSON();
    },

    /**
     * @override {Field}
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
