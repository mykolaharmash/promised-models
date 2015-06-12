/**
 * Promised models
 */

var EventEmitter = require('eventemitter3'),
    Vow = require('vow'),
    uniq = require('./uniq'),
    Inheritable = require('./inheritable'),

    /**
     * @class
     * @prop {object} [data] initial data
     */
    Model = Inheritable.inherit({
        __constructor: function (id, data) {
            var model = this,
                Storage = this.storage || Model.Storage;
            this.CHANGE_BRANCH = uniq();
            this.CALCULATIONS_BRANCH = uniq();
            if (arguments.length === 1) {
                if (typeof id === 'object') {
                    data = id;
                    id = null;
                }
            }
            this.id = id;
            data = data || {};
            this._eventEmitter = new EventEmitter();
            this._readyPromise = Vow.fulfill();
            this.storage = new Storage();
            this.attributes = Object.keys(this.attributes || {}).reduce(function (attributes, name) {
                var Attribute = model.attributes[name];
                attributes[name] = new (Attribute.inherit({
                    name: name,
                    model: model
                }))(data[name]);
                return attributes;
            }, {});
            this._attributesAr = Object.keys(this.attributes).map(function (name) {
                return model.attributes[name];
            });
            this.commit(this.CHANGE_BRANCH);
            this.calculate().done();
        },

        /**
         * when false calculation errors will be silent
         * @type {Boolean}
         */
        throwCalculationErrors: true,

        /**
         * if model was synced with storage
         * @return {Boolean}
         */
        isNew: function () {
            return !this.id;
        },

        /**
         * save model changes
         * @return {Promise}
         */
        save: function () {
            var model = this;
            return this._rejectDestructed().then(function () {
                if (model.isNew()) {
                    return model.ready().then(function () {
                        return model.storage.insert(model);
                    }).then(function (id) {
                        model.id = id;
                        model.commit();
                        model.calculate().done();
                        return model.ready();
                    });
                } else {
                    return model.ready().then(function () {
                        return model.storage.update(model);
                    }).then(function () {
                        model.commit();
                    });
                }
            });
        },

        /**
         * fetch model from storage
         * @return {Promise}
         */
        fetch: function () {
            var model = this;
            return Vow.fulfill().then(function () {
                return model.storage.find(model);
            }).then(function (data) {
                model.set(data);
                return model.ready();
            }).then(function () {
                model.commit();
            });
        },

        /**
         * remove model from storage and destruct it
         * @return {Promise}
         */
        remove: function () {
            var model = this;
            if (model.isNew()) {
                model.destruct();
                return Vow.fulfill();
            } else {
                return Vow.fulfill().then(function () {
                    return model.storage.remove(model);
                }).then(function () {
                    model.destruct();
                });
            }
        },

        /**
         * check of model destruted
         * @return {Boolean}
         */
        isDestructed: function () {
            return Boolean(this._isDestructed);
        },

        /**
         * destruct model instance
         */
        destruct: function () {
            this._isDestructed = true;
            this.trigger('destruct');
            this._eventEmitter.removeAllListeners();
        },


        /**
         * check if model is valid
         * @return {Promise<, {Model.ValidationError}>}
         */
        validate: function () {
            var model = this;
            return model.ready().then(function () {
                return Vow.all(model._attributesAr.map(function (attribute) {
                    return attribute.validate();
                }));
            }).then(function (validateResults) {
                if (
                    //return 0 if any is false
                    Math.min.apply(Math, validateResults)
                ) {
                    return Vow.fulfill(true);
                } else {
                    return Vow.reject(validateResults.reduce(function (err, isValid, k) {
                        if (!isValid) {
                            err.attributes.push(model._attributesAr[k]);
                        }
                        return err;
                    }, new model.__self.ValidationError()));
                }
            });
        },

        /**
         * check if any attribute is changed
         * @prop {string} [branch=DEFAULT_BRANCH]
         * @return {Boolean}
         */
        isChanged: function (branch) {
            var model = this;
            return Object.keys(this.attributes).some(function (name) {
                return model.attributes[name].isChanged(branch);
            });
        },

        /**
         * revert all attributes to initial or last commited value
         * @prop {string} [branch=DEFAULT_BRANCH]
         */
        revert: function (branch) {
            var model = this;
            return Object.keys(this.attributes).forEach(function (name) {
                return model.attributes[name].revert(branch);
            });
        },

        /**
         * commit current value, to not be rolled back
         * @prop {string} [branch=DEFAULT_BRANCH]
         */
        commit: function (branch) {
            var model = this;
            return Object.keys(this.attributes).forEach(function (name) {
                return model.attributes[name].commit(branch);
            });
        },

        /**
         * set attribute value
         * @param {string|object} name or data
         * @param {*} value
         * @return {Boolean} if attribute found
         */
        set: function (name, value) {
            var model = this,
                data;
            if (arguments.length === 1) {
                data = name;
                Object.keys(data).forEach(function (name) {
                    if (data[name] !== undefined) {
                        model.set(name, data[name]);
                    }
                });
            } else if (this.attributes[name]) {
                this.attributes[name].set(value);
            } else {
                return false;
            }
            return true;

        },

        /**
         * get attribute valie
         * @param  {string} attributeName
         * @return {*}
         */
        get: function (attributeName) {
            this._throwMissedAttribute(attributeName);
            return this.attributes[attributeName].get();
        },

        /**
         * return model data
         * @return {object}
         */
        toJSON: function () {
            var model = this;
            return Object.keys(this.attributes).filter(function (name) {
                return !model.attributes[name].internal;
            }).reduce(function (json, name) {
                var attribute = model.attributes[name];
                json[name] = attribute.toJSON();
                return json;
            }, {});
        },

        /**
         * unbind events on attributes or model
         * @param  {string}   [attribute] space separated list
         * @param  {string}   event space separated list
         * @param  {Function} cb
         * @param  {*}   [ctx]
         */
        un: function (attribute, event, cb, ctx) {
            this._callEventEmitter('removeListener', attribute, event, cb, ctx);
        },

        /**
         * bind events on attributes or model
         * @param  {string}   [attribute] space separated list
         * @param  {string}   event space separated list
         * @param  {Function} cb
         * @param  {*}   [ctx]
         */
        on: function (attribute, event, cb, ctx) {
            this._callEventEmitter('on', attribute, event, cb, ctx);
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
                //promise not changed or rejected
                if (model._readyPromise === p) {
                    return p;
                } else {
                    return model.ready();
                }
            });
        },

        /**
         * make all calculations for attributes
         * @return {Promise}
         */
        calculate: function () {
            if (this.isReady()) {
                this.trigger('calculate');
                this._readyPromise = this._calculate();
            } else {
                this._requireMoreCalculations = true;
            }
            if (this.throwCalculationErrors) {
                return this._readyPromise;
            } else {
                return this._readyPromise.always(function () {
                    return Vow.fulfill();
                });
            }

        },

        /**
         * to prevent loop calculations we limit it
         * @type {Number}
         */
        maxCalculations: 100,

        /**
         * marker that requires one more calculation cycle
         * @type {Boolean}
         */
        _requireMoreCalculations: false,

        /**
         * @param  {Number} [n = 0] itteration
         * @return {Promise}
         */
        _calculate: function (n) {
            var model = this,
                calculations = {},
                amendings = [],
                nestedCalculations = [];

            n = n || 0;

            if (n >= model.maxCalculations) {
                return model._throwCalculationLoop();
            }

            model.commit(model.CALCULATIONS_BRANCH);

            model._attributesAr.forEach(function (attribute) {
                if (attribute.calculate) {
                    calculations[attribute.name] = attribute.calculate();
                }
                if (attribute.amend && attribute.isChanged(model.CHANGE_BRANCH)) {
                    amendings.push(attribute.amend());
                }
                if (attribute.ready) {
                    nestedCalculations.push(attribute.ready());
                }
            });
            return Vow.all([
                Vow.all(calculations),
                Vow.all(amendings),
                Vow.all(nestedCalculations)
            ]).spread(function (calculateData) {
                model.set(calculateData);
                if (model.isChanged(model.CALCULATIONS_BRANCH) || model._requireMoreCalculations) {
                    model._requireMoreCalculations = false;
                    return model._calculate(++n);
                } else {
                    model._triggerEvents();
                }
            });
        },

        /**
         * @return {Promise<, {Error}>} rejected promise
         */
        _throwCalculationLoop: function () {
            var model = this,
                changedFields = model._attributesAr.filter(function (attribute) {
                    return attribute.isChanged(model.CALCULATIONS_BRANCH);
                }).map(function (attribute) {
                    return attribute.name;
                });
            return Vow.reject(new Error(
                'After ' +
                model.maxCalculations +
                ' calculations fileds ' +
                changedFields +
                ' still changed'
            ));
        },

        _triggerEvents: function () {
            var model = this,
                changedFileds;
            if (model.isChanged(model.CHANGE_BRANCH)) {
                changedFileds = model._attributesAr.filter(function (attribute) {
                    return attribute.isChanged(model.CHANGE_BRANCH);
                });
                model.commit(model.CHANGE_BRANCH);
                changedFileds.forEach(function (attribute) {
                    model._emitAttributeChange(attribute);
                });
                model._emitChange();
            }
        },

        /**
         * bind events on attributes or model
         * @param  {string}   method of EventEmitter
         * @param  {string}   [attribute] space separated list
         * @param  {string}   event space separated list
         * @param  {Function} cb
         * @param  {*}   [ctx]
         */
        _callEventEmitter: function (method, attribute, event, cb, ctx) {
            var model = this;
            if (typeof event !== 'string') {
                ctx = cb;
                cb = event;
                event = attribute;
                attribute = undefined;
            }
            ctx = ctx || this;
            if (attribute) {
                attribute.split(/\s+/).forEach(function (attribute) {
                    event.split(/\s+/).forEach(function (event) {
                        model._eventEmitter[method](event + ':' + attribute, cb, ctx);
                    });
                });
            } else {
                event.split(/\s+/).forEach(function (event) {
                    model._eventEmitter[method](event, cb, ctx);
                });
            }
        },

        /**
         * @param  {Model.Attribute} attribute
         */
        _emitAttributeChange: function (attribute) {
            this.trigger('change:' + attribute.name);
        },

        _emitChange: function () {
            this.trigger('change');
        },

        /**
         * @return {Promise}
         */
        _rejectDestructed: function () {
            if (this.isDestructed()) {
                return Vow.reject(new Error ('Model is destructed'));
            } else {
                return Vow.fulfill();
            }
        },

        _throwMissedAttribute: function (attributeName) {
            if (!this.attributes[attributeName]) {
                throw new Error('Unknown attribute ' + attributeName);
            }
        }

    }, {

        /**
         * @class
         * @abstract
         */
        Storage: require('./storage'),

        attributeTypes: {
            String: require('./types/string'),
            Number: require('./types/number'),
            Boolean: require('./types/boolean'),
            List: require('./types/list'),
            Model: require('./types/model'),
            ModelsList: require('./types/models-list'),
            Object: require('./types/object')
        },

        /**
         * @type {Attribute}
         * @prop {*} [initValue]
         */
        Attribute: require('./attribute'),

        /**
         * @class <{Error}>
         * @prop {Array<{Attribute}>} attributes
         */
        ValidationError: (function () {
            var ValidationError = function () {
                this.name = 'ValidationError';
                this.attributes = [];
                Error.call(this); //super constructor
                Error.captureStackTrace(this, this.constructor);
            };
            ValidationError.prototype = new Error();
            ValidationError.prototype.constructor = ValidationError;
            return ValidationError;
        }())

    });

module.exports = Model;
