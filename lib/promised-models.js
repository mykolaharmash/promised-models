/**
 * Promised models
 */

var inherit = require('inherit'),
    /**
     * @class
     */
    Models = inherit({
        __constructor: function () {
            var model = this;
            this.fields = Object.keys(this.fields).reduce(function (fields, name) {
                var Schema = model.fields[name],
                    FieldType = model.__self.FieldTypes[Schema.type];
                if (!FieldType) {
                    throw new Error('Unknown field type ' + Schema.type);
                }
                fields[name] = new (inherit([
                    model.__self.Field,
                    FieldType,
                    Schema
                ], {
                    model: model
                }))();
                return fields;
            }, {});
        },
        _throwMissedField: function (fieldName) {
            if (!this.fields[fieldName]) {
                throw new Error('Unknown field ' + fieldName);
            }
        },

        /**
         * get field valie
         * @param  {string} fieldName
         * @return {*}
         */
        get: function (fieldName) {
            this._throwMissedField(fieldName);
            return this.fields[fieldName].get();
        }
    }, {

        /**
         * @type {Object<type, fieldMixin>}
         */
        FieldTypes: {
            string: {

                default: '',

                /**
                 * @override {Field}
                 */
                toFieldType: function (value) {
                    return String(value);
                }
            }
        },

        /**
         * @class
         */
        Field: inherit({
            /**
             * Convert value to field type
             * @abstract
             * @prop {*} value
             * @return {*}
             */
            toFieldType: function () {
                throw new Error('Not implemented');
            },

            _getDefault: function () {
                return typeof this.default === 'function' ? this.default() : this.default;
            },

            __constructor: function () {
                this.value = this.toFieldType(this._getDefault());
            },

            /**
             * get field value
             * @return {*}
             */
            get: function () {
                return this.value;
            }
        }),
        /**
         * inherit model class
         * @param  {object} props
         * @param  {object} [staticProps]
         * @return {Models}
         */
        inherit: function (props, staticProps) {
            return inherit(this, props, staticProps);
        }
    });

module.exports = Models;

