
var inherit = require('inherit'),
    DEFAULT_BRANCH = 'DEFAULT_BRANCH';

/**
 * Model field
 * @class {EventEmitter}
 * @prop {*} [initValue]
 */
module.exports = inherit({
    __constructor: function (initValue) {
        this._cachBranches = {};
        this.value = this.parse(
            initValue === undefined ?
            this._callOrGetDefault() :
            initValue
        );
        this.commit();
    },

    /**
     * check if field is valid
     * @abstract
     * @return {Boolean|Promise<{Boolean}>}
     */
    validate: function () {
        return true;
    },

    /**
     * return serializable value of field
     * @return {*}
     */
    toJSON: function () {
        return this.get();
    },

    /**
     * check value to be equal to field value
     * @param  {*}  value
     * @return {Boolean}
     */
    isEqual: function (value) {
        return this.value === this.parse(value);
    },

    /**
     * check if field was changed after last commit
     * @prop {string} [branch=DEFAULT_BRANCH]
     * @return {Boolean}
     */
    isChanged: function (branch) {
        branch = branch || DEFAULT_BRANCH;
        return !this.isEqual(this._cachBranches[branch]);
    },

    /**
     * revert field value to initial or last commited
     * @prop {string} [branch=DEFAULT_BRANCH]
     */
    revert: function (branch) {
        branch = branch || DEFAULT_BRANCH;
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
        branch = branch || DEFAULT_BRANCH;
        this._cachBranches[branch] = this.value;
    },

    /**
     * set field value
     * @param {*} value
     */
    set: function (value) {
        if (!this.isEqual(value)) {
            this.value = this.parse(value);
            this._emitChange();
        }
    },

    /**
     * get field value
     * @return {*}
     */
    get: function () {
        return this.value;
    },

    /**
     * Convert value to field type
     * @abstract
     * @prop {*} value
     * @return {*}
     */
    parse: function () {
        throw new Error('Not implemented');
    },

    /**
     * Calculate new field value
     * @function
     * @name Field#calculate
     * @return {Promise<{*}>|*} field value
     */

    /**
     * Change other fields value from  current field
     * @function
     * @name Field#amend
     * @return {Promise} when done
     */

    _emitChange: function () {
        this.model.calculate().done();
    },

    _callOrGetDefault: function () {
        return typeof this.default === 'function' ? this.default() : this.default;
    }

});
