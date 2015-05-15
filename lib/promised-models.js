/**
 * Promised models
 */

var inherit = require('inherit'),
    EventEmitter = require('eventemitter3'),
    debounce = require('lodash.debounce'),

    /**
     * @class
     * @prop {object} [data] initial data
     */
    Models = inherit({
        __constructor: function (data) {
            var model = this;
            data = data || {};
            this._eventEmitter = new EventEmitter();
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
                    model: model,
                    name: name
                }))(data[name]);
                return fields;
            }, {});
        },

        /**
         * check if any field is changed
         * @return {Boolean}
         */
        isChanged: function () {
            var model = this;
            return Object.keys(this.fields).some(function (name) {
                return model.fields[name].isChanged();
            });
        },

        /**
         * rollback all fields to initial or last fixed value
         */
        rollback: function () {
            var model = this;
            return Object.keys(this.fields).forEach(function (name) {
                return model.fields[name].rollback();
            });
        },

        /**
         * fix current value, to not be rolled back
         */
        fix: function () {
            var model = this;
            return Object.keys(this.fields).forEach(function (name) {
                return model.fields[name].fix();
            });
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

        /**
         * unbind events on fields or model
         * @param  {string}   [field] space separated list
         * @param  {string}   event space separated list
         * @param  {Function} cb
         * @param  {*}   [ctx]   [description]
         */
        un: function (field, event, cb, ctx) {
            this._callEventEmitter('removeListener', field, event, cb, ctx);
        },

        /**
         * bind events on fields or model
         * @param  {string}   [field] space separated list
         * @param  {string}   event space separated list
         * @param  {Function} cb
         * @param  {*}   [ctx]   [description]
         */
        on: function (field, event, cb, ctx) {
            this._callEventEmitter('on', field, event, cb, ctx);
        },

        /**
         * @see EventEmitter.emit
         */
        trigger: function () {
            this._eventEmitter.emit.apply(this._eventEmitter, arguments);
        },

        /**
         * bind events on fields or model
         * @param  {string}   method of EventEmitter
         * @param  {string}   [field] space separated list
         * @param  {string}   event space separated list
         * @param  {Function} cb
         * @param  {*}   [ctx]   [description]
         */
        _callEventEmitter: function (method, field, event, cb, ctx) {
            var model = this;
            if (typeof event !== 'string') {
                ctx = cb;
                cb = event;
                event = field;
                field = undefined;
            }
            ctx = ctx || this;
            if (field) {
                field.split(/\s+/).forEach(function (field) {
                    event.split(/\s+/).forEach(function (event) {
                        model._eventEmitter[method](event + ':' + field, cb, ctx);
                    });
                });
            } else {
                event.split(/\s+/).forEach(function (event) {
                    model._eventEmitter[method](event, cb, ctx);
                });
            }
        },

        _emitFiledChange: function (field) {
            this.trigger('change:' + field.name);
            this._emitChange();
        },

        _emitChange: debounce(function () {
            this.trigger('change');
        }, 0),

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
         * @class {EventEmitter}
         * @prop {*} [initValue]
         */
        Field: inherit(EventEmitter, {
            __constructor: function (initValue) {
                this.value = this._prepropcessAndParse(
                    initValue === undefined ?
                    this._callOrGetDefault() :
                    initValue
                );
                this.fix();
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
                return this.value === value;
            },

            /**
             * check if field was changed after last fix
             * @return {Boolean}
             */
            isChanged: function () {
                return !this.isEqual(this.cashedValue);
            },

            /**
             * revert field value to initial or last fixed
             */
            rollback: function () {
                if (!this.isEqual(this.cashedValue)) {
                    this.value = this.cashedValue;
                    this._emitChange();
                }
            },

            /**
             * prevent current value to be rolled back
             */
            fix: function () {
                this.cashedValue = this.value;
            },

            /**
             * set field value
             * @param {*} value
             */
            set: function (value) {
                if (!this.isEqual(value)) {
                    this.value = this._prepropcessAndParse(value);
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

            _emitChange: function () {
                this.model._emitFiledChange(this);
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

