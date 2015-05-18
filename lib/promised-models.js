/**
 * Promised models
 */

var inherit = require('inherit'),
    EventEmitter = require('eventemitter3'),
    Vow = require('vow'),
    DEFAULT_BRANCH = 'DEFAULT_BRANCH',
    CALCULATIONS_BRANCH = 'CALCULATIONS_BRANCH',
    CHANGE_BRANCH = 'CHANGE_BRANCH',

    /**
     * @class
     * @prop {object} [data] initial data
     */
    Models = inherit({
        __constructor: function (data) {
            var model = this;
            data = data || {};
            this._eventEmitter = new EventEmitter();
            this._readyPromise = Vow.fulfill();
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
            this._fieldsAr = Object.keys(this.fields).map(function (name) {
                return model.fields[name];
            });
            this.commit(CHANGE_BRANCH);
            this.calculate().done();
        },

        /**
         * check if model is valid
         * @return {Promise<, {Models.ValidationError}>}
         */
        validate: function () {
            var model = this;
            return Vow.all(this._fieldsAr.map(function (field) {
                return field.validate();
            })).then(function (validateResults) {
                if (
                    //return 0 if any is false
                    Math.min.apply(Math, validateResults)
                ) {
                    return Vow.fulfill();
                } else {
                    return Vow.reject(validateResults.reduce(function (err, isValid, k) {
                        if (!isValid) {
                            err.fields.push(model._fieldsAr[k]);
                        }
                        return err;
                    }, new model.__self.ValidationError()));
                }
            });
        },

        /**
         * check if any field is changed
         * @prop {string} [branch=DEFAULT_BRANCH]
         * @return {Boolean}
         */
        isChanged: function (branch) {
            var model = this;
            return Object.keys(this.fields).some(function (name) {
                return model.fields[name].isChanged(branch);
            });
        },

        /**
         * revert all fields to initial or last commited value
         * @prop {string} [branch=DEFAULT_BRANCH]
         */
        revert: function (branch) {
            var model = this;
            return Object.keys(this.fields).forEach(function (name) {
                return model.fields[name].revert(branch);
            });
        },

        /**
         * commit current value, to not be rolled back
         * @prop {string} [branch=DEFAULT_BRANCH]
         */
        commit: function (branch) {
            var model = this;
            return Object.keys(this.fields).forEach(function (name) {
                return model.fields[name].commit(branch);
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
         * if all calculations are done
         * @return {Boolean}
         */
        isReady: function () {
            return this._readyPromise.isResolved();
        },

        /**
         * wait for all calculations to be done
         * @return {Promise}
         */
        ready: function () {
            var model = this;
            return model._readyPromise.always(function (p) {
                //promise not changed
                if (model._readyPromise === p) {
                    return p;
                } else {
                    return model.ready();
                }
            });
        },

        /**
         * make all calculations for fields
         * @return {Promise}
         */
        calculate: function () {
            if (this.isReady()) {
                this._readyPromise = this._calculate();
            }
            return this._readyPromise;
        },

        _calculate: function () {
            var model = this;
            model.commit(CALCULATIONS_BRANCH);
            return Vow.all(model._fieldsAr.reduce(function (data, field) {
                if (field.calculate) {
                    data[field.name] = field.calculate();
                }
                return data;
            }, {})).then(function (newData) {
                model.set(newData);
                if (model.isChanged(CALCULATIONS_BRANCH)) {
                    return model._calculate();
                } else {
                    model._triggerEvents();
                }
            });
        },

        _triggerEvents: function () {
            var model = this;
            if (model.isChanged(CHANGE_BRANCH)) {
                model._fieldsAr.forEach(function (field) {
                    if (field.isChanged(CHANGE_BRANCH)) {
                        model._emitFieldChange(field);
                    }
                });
                model._emitChange();
                model.commit(CHANGE_BRANCH);
            }
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

        /**
         * @param  {Model.Field} field
         */
        _emitFieldChange: function (field) {
            this.trigger('change:' + field.name);
        },

        _emitChange: function () {
            this.trigger('change');
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
         * @class {EventEmitter}
         * @prop {*} [initValue]
         */
        Field: inherit(EventEmitter, {
            __constructor: function (initValue) {
                this._cachBranches = {};
                this.value = this._prepropcessAndParse(
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
                return this.value === value;
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
                this.model.calculate().done();
            },

            _prepropcessAndParse: function (value) {
                return this.parse(value);
            },

            _callOrGetDefault: function () {
                return typeof this.default === 'function' ? this.default() : this.default;
            }

        }),

        /**
         * @class <{Error}>
         * @prop {Array<{Field}>} fields
         */
        ValidationError: (function () {
            var ValidationError = function () {
                this.name = 'ValidationError';
                this.fields = [];
                Error.call(this); //super constructor
                Error.captureStackTrace(this, this.constructor);
            };
            ValidationError.prototype = new Error();
            ValidationError.prototype.constructor = ValidationError;
            return ValidationError;
        }()),

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

