/**
 * Array like list
 */

/**
 * @class
 * @param {Model.Field} field
 */
var List = function (field) {
        this._field = field;
    };

/**
 * @param  {Array}  value
 * @return {Boolean}
 */
List.prototype.isEqual = function (value) {
    return this._field.isEqual(value);
};

/**
 * return copy of wraped array
 * @return {Array}
 */
List.prototype.toArray = function () {
    return this._field.value.slice();
};

/**
 * get items by key
 * @param  {Number} k
 * @return {*}
 */
List.prototype.get = function (k) {
    return this._field.value[k];
};

/**
 * know list length
 * @return {Number}
 */
List.prototype.length = function () {
    return this._field.value.length;
};

//extend list with array methods
['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'].forEach(function (methodName) {
    List.prototype[methodName] = function () {
        var res;
        if (this._field.isListCashed(this._field.value)) {
            this._field.value = this.toArray();
        }
        res = Array.prototype[methodName].apply(this._field.value, arguments);
        this._field.emitListChange();
        return res;
    };
});

module.exports = List;