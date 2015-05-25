/**
 * Array like list
 */

/**
 * @class
 * @param {Model.Attribute} attribute
 */
var List = function (attribute) {
        this._attribute = attribute;
    };

/**
 * @param  {Array}  value
 * @return {Boolean}
 */
List.prototype.isEqual = function (value) {
    return this._attribute.isEqual(value);
};

/**
 * return copy of wraped array
 * @return {Array}
 */
List.prototype.toArray = function () {
    return this._attribute.value.slice();
};

/**
 * get items by key
 * @param  {Number} k
 * @return {*}
 */
List.prototype.get = function (k) {
    return this._attribute.value[k];
};

/**
 * know list length
 * @return {Number}
 */
List.prototype.length = function () {
    return this._attribute.value.length;
};

//extend list with array methods
['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'].forEach(function (methodName) {
    List.prototype[methodName] = function () {
        var res;
        if (this._attribute.isListCashed(this._attribute.value)) {
            this._attribute.value = this.toArray();
        }
        res = Array.prototype[methodName].apply(this._attribute.value, arguments);
        this._attribute.emitListChange();
        return res;
    };
});

module.exports = List;
