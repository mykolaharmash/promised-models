/**
 * Models list
 */
var Attribute = require('../attribute'), ModelsList, ModelsListStatic,
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
 * Attribute with nested model
 * @class {Attribute}
 */
ModelsList = Attribute.inherit({
    __constructor: function () {
        this.__base.apply(this, arguments);
        this.LISTEN_BRANCH = uniq();
        this._registerEvents();
    },

    default: [],

    modelType: null,

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
     * @override {Attribute}
     */
    get: function () {
        return (new List(this));
    },

    /**
     * @override {Attribute}
     */
    ready: function () {
        return Vow.all(this.value.map(function (model) {
            return model.ready();
        }));
    },

    /**
     * @override {Attribute}
     */
    validate: function () {
        return Vow.all(this.value.map(function (model) {
            return model.validate();
        })).then(function () {
            return 1;
        });
    },

    /**
     * @override {Attribute}
     */
    toJSON: function () {
        return this.value.map(function (model) {
            return model.toJSON();
        });
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
     * @override
     */
    set: function (value) {
        if (!this.isEqual(value)) {
            this.value = this._toAttributeValue(value);
            this.emitListChange();
        }
    },

    /**
     * @override {Attribute}
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
     * @override {Attribute}
     */
    commit: function (branch) {
        this.__base(branch);
        this.value.map(function (model) {
            return model.commit(branch);
        });
    },

    /**
     * @override {Attribute}
     */
    revert: function (branch) {
        this.__base(branch);
        this.value.map(function (model) {
            return model.revert(branch);
        });
    },

    /**
     * @override {Attribute}
     */
    getLastCommitted: function (branch) {
        return this.value.map(function (model) {
            return model.getLastCommitted(branch);
        });
    },

    /**
     * @override {Attribute}
     */
    _toAttributeValue: function (value) {
        var arr = [].concat(value),
            attribute = this;
        return arr.map(function (data) {
            if (data instanceof attribute.modelType) {
                return data;
            } else {
                return new attribute.modelType(data);
            }
        });
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
        var attribute = this;
        attribute.value.forEach(function (value, key) {
            if (!(value instanceof attribute.modelType)) {
                attribute.value[key] =  new attribute.modelType(value);
            }
        });
        attribute._registerEvents();
        attribute._emitChange();
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
            attribute = this;
        newModels.forEach(function (model) {
            model.on('calculate', attribute._onModelCalculate, attribute);
            model.on('destruct', attribute._onModelDestruct, attribute);
        });
        lostModels.forEach(function (model) {
            model.un('calculate', attribute._onModelCalculate, attribute);
            model.un('destruct', attribute._onModelDestruct, attribute);
        });
        attribute.commit(attribute.LISTEN_BRANCH);
    }

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
