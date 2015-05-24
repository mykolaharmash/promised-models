/**
 * Models list
 */
var Field = require('../field'), ModelsList, ModelsListStatic,
    List = require('../list'),
    /**
     * to calculate difference between arrays
     * @param  {Array} ar1
     * @param  {Array} ar2
     * @return {Array}
     */
    diff = function (ar1, ar2) {
        return ar1.filter(function (item) {
            return ar2.indexOf(item) === -1;
        });
    },
    Vow = require('vow'),
    uniq = require('../uniq');

/**
 * Field with nested model
 * @class {Field}
 */
ModelsList = Field.inherit({
    __constructor: function () {
        this.__base.apply(this, arguments);
        this.LISTEN_BRANCH = uniq();
        this._registerEvents();
    },

    default: [],

    modelType: null,

    /**
     * @override {Field}
     */
    get: function () {
        return (new List(this));
    },

    /**
     * @override {Field}
     */
    ready: function () {
        return Vow.all(this.value.map(function (model) {
            return model.ready();
        }));
    },

    /**
     * @override {Field}
     */
    validate: function () {
        return Vow.all(this.value.map(function (model) {
            return model.validate();
        })).then(function () {
            return 1;
        });
    },

    /**
     * @override {Field}
     */
    toJSON: function () {
        return this.value.map(function (model) {
            return model.toJSON();
        });
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
    isChanged: function (branch) {
        return this.__base(branch) ||
            Boolean(
                this.value.length &&
                Math.max.apply(Math, this.value.map(function (model) {
                    return model.isChanged(branch);
                }))
            );
    },

    /**
     * @override {Field}
     */
    commit: function (branch) {
        this.__base(branch);
        this.value.map(function (model) {
            return model.commit(branch);
        });
    },

    /**
     * @override {Field}
     */
    revert: function (branch) {
        this.__base(branch);
        this.value.map(function (model) {
            return model.revert(branch);
        });
    },

    /**
     * @override {Field}
     */
    parse: function (value) {
        var arr = [].concat(value),
            field = this;
        return arr.map(function (data) {
            if (data instanceof field.modelType) {
                return data;
            } else {
                return new field.modelType(data);
            }
        });
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
        var field = this;
        field.value.forEach(function (value, key) {
            if (!(value instanceof field.modelType)) {
                field.value[key] =  new field.modelType(value);
            }
        });
        field._registerEvents();
        field._emitChange();
    },

    _onModelCalculate: function () {
        this._emitChange();
    },

    _onModelDestruct: function () {
        this.set(this.value.filter(function (model) {
            return !model.isDestructed();
        }));
    },

    _registerEvents: function () {
        var listenCache = this._cachBranches[this.LISTEN_BRANCH] || [],
            lostModels = diff(listenCache, this.value),
            newModels = diff(this.value, listenCache),
            field = this;
        newModels.forEach(function (model) {
            model.on('calculate', field._onModelCalculate, field);
            model.on('destruct', field._onModelDestruct, field);
        });
        lostModels.forEach(function (model) {
            model.un('calculate', field._onModelCalculate, field);
            model.un('destruct', field._onModelDestruct, field);
        });
        field.commit(field.LISTEN_BRANCH);
    },

});

/**
 * Static constructor for ModelsList
 * @class
 */
ModelsListStatic = function (value) {
    if (this instanceof ModelsListStatic) {
        return new ModelsList(value);
    } else {
        return ModelsList.inherit({
            modelType: value
        });
    }
};
ModelsListStatic.inherit = ModelsList.inherit.bind(ModelsList);
module.exports = ModelsListStatic;
