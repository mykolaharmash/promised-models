/**
 * Promised models
 */

var inherit = require('inherit'),
    /**
     * @class
     * @prop {object} [data] initial data
     */
    Models = inherit({
        __constructor: function (data) {
            var model = this;
            data = data || {};
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
                }))(data[name]);
                return fields;
            }, {});
        },

        /**
         * set field value
         * @param {string|object} name or data
         * @param {*} value
         * @return {Boolean} if field found
         */
        set: function (name, value) {
            var model = this,
                data;
            if (arguments.length === 1) {
                data = name;
                Object.keys(data).forEach(function (name) {
                    model.set(name, data[name]);
                });
            } else if (this.fields[name]) {
                this.fields[name].set(value);
            } else {
                return false;
            }
            return true;

        },

        /**
         * get field valie
         * @param  {string} fieldName
         * @return {*}
         */
        get: function (fieldName) {
            this._throwMissedField(fieldName);
            return this.fields[fieldName].get();
        },

        /**
         * return model data
         * @return {object}
         */
        toJSON: function () {
            var model = this;
            return Object.keys(this.fields).filter(function (name) {
                return !model.fields[name].internal;
            }).reduce(function (json, name) {
                var field = model.fields[name];
                json[name] = field.toJSON();
                return json;
            }, {});
        },

        _throwMissedField: function (fieldName) {
            if (!this.fields[fieldName]) {
                throw new Error('Unknown field ' + fieldName);
            }
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
                parse: function (value) {
                    return String(value);
                }
            }
        },

        /**
         * @class
         * @prop {*} [initValue]
         */
        Field: inherit({
            __constructor: function (initValue) {
                this.value = this._prepropcessAndParse(
                    initValue === undefined ?
                    this._callOrGetDefault() :
                    initValue
                );
            },

            /**
             * return serializable value of field
             * @return {*}
             */
            toJSON: function () {
                return this.get();
            },

            /**
             * set field value
             * @param {*} value
             */
            set: function (value) {
                this.value = this._prepropcessAndParse(value);
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

            _prepropcessAndParse: function (value) {
                return this.parse(value);
            },

            _callOrGetDefault: function () {
                return typeof this.default === 'function' ? this.default() : this.default;
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

