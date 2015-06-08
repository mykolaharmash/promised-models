
var Inheritable = require('./inheritable');

/**
 * Model attribute
 * @class {EventEmitter}
 * @prop {*} [initValue]
 */
var Attribute = Inheritable.inherit({
    __constructor: function (initValue) {
        this._cachBranches = {};
        this.DEFAULT_BRANCH = 'DEFAULT_BRANCH';
        this.value = this.parse(
            initValue === undefined ?
            this._callOrGetDefault() :
            initValue
        );
        this.commit();
    },

    /**
     * check if attribute is valid
     * @abstract
     * @return {Boolean|Promise<{Boolean}>}
     */
    validate: function () {
        return true;
    },

    /**
     * return serializable value of attribute
     * @return {*}
     */
    toJSON: function () {
        return this.get();
    },

    /**
     * check value to be equal to attribute value
     * @param  {*}  value
     * @return {Boolean}
     */
    isEqual: function (value) {
        return this.value === this.parse(value);
    },

    /**
     * check if attribute was changed after last commit
     * @prop {string} [branch=DEFAULT_BRANCH]
     * @return {Boolean}
     */
    isChanged: function (branch) {
        branch = branch || this.DEFAULT_BRANCH;
        return !this.isEqual(this._cachBranches[branch]);
    },

    /**
     * revert attribute value to initial or last commited
     * @prop {string} [branch=DEFAULT_BRANCH]
     */
    revert: function (branch) {
        branch = branch || this.DEFAULT_BRANCH;
        if (!this.isEqual(this._cachBranches[branch])) {
            this.value = this._cachBranches[branch];
            this._emitChange();
        }
    },

    /**
     * prevent current value to be rolled back
     * @prop {string} [branch=DEFAULT_BRANCH]
     */
    commit: function (branch) {
        branch = branch || this.DEFAULT_BRANCH;
        this._cachBranches[branch] = this.value;
    },

    /**
     * set attribute value
     * @param {*} value
     */
    set: function (value) {
        if (!this.isEqual(value)) {
            this.value = this.parse(value);
            this._emitChange();
        }
    },

    /**
     * get attribute value
     * @return {*}
     */
    get: function () {
        if (arguments.length > 0) {
            throw new Error('Attribute.get() supports no arguments');
        }
        return this.value;
    },

    /**
     * Convert value to attribute type
     * @abstract
     * @prop {*} value
     * @return {*}
     */
    parse: function () {
        throw new Error('Not implemented');
    },

    /**
     * Calculate new attribute value
     * @function
     * @name Attribute#calculate
     * @return {Promise<{*}>|*} attribute value
     */

    /**
     * Change other attributes value from  current attribute
     * @function
     * @name Attribute#amend
     * @return {Promise} when done
     */

    _emitChange: function () {
        this.model.calculate().done();
    },

    _callOrGetDefault: function () {
        return typeof this.default === 'function' ? this.default() : this.default;
    }

});

module.exports = Attribute;
