/**
 * Promised models
 */

var Events = require('./events'),
    Vow = require('vow'),
    uniq = require('./uniq'),
    IdAttribute = require('./types/id'),
    Attribute = require('./attribute'),
    fulfill = require('./fulfill'),

    /**
     * @class Model
     * @extends Events
     */
    Model = Events.inherit(/** @lends Model.prototype */{

        /**
         * @deprecated use getId method
         */
        id: null,

        /**
         * @param {*} [id]
         * @param {Object} [data] initial data
         */
        __constructor: function (id, data) {
            var model = this,
                Storage = this.storage || Model.Storage,
                hasIdAttribute,
                modelAttributes;

            this.__base.apply(this, arguments);

            this.CHANGE_BRANCH = uniq();
            this.CALCULATIONS_BRANCH = uniq();
            if (arguments.length === 1) {
                if (typeof id === 'object') {
                    data = id;
                    id = null;
                }
            }

            data = data || {};

            this._ready = true;
            this._readyPromise = fulfill();
            this.storage = new Storage();

            modelAttributes = this.attributes || {};
            hasIdAttribute = Object.keys(modelAttributes).some(function (name) {
                return modelAttributes[name].prototype.isId;
            });

            if (!hasIdAttribute) {
                modelAttributes.id = IdAttribute;
            }

            // todo: remove after removing id property support
            if (id !== null) {
                data.id = id;
            }

            this.attributes = Object.keys(modelAttributes).reduce(function (attributes, name) {
                var Attribute = modelAttributes[name];

                attributes[name] = new (Attribute.inherit({
                    name: name,
                    model: model
                }))(data[name]);

                if (attributes[name].isId) {
                    this.idAttribute = attributes[name];
                }

                return attributes;
            }.bind(this), {});

            // todo: remove after removing id property support
            this.id = this.idAttribute.get();
            this.on('change:' + this.idAttribute.name, function () {
                this.id = this.idAttribute.get();
            }, this);

            this._attributesAr = Object.keys(this.attributes).map(function (name) {
                return model.attributes[name];
            });
            this.commit(this.CHANGE_BRANCH);
            this.calculate().done();
        },

        /**
         * @returns {*}
         */
        getId: function () {
            return this.idAttribute.get();
        },

        /**
         * set attribute to default value
         * @param  {string} attributeName
         */
        unset: function (attributeName) {
            this._throwMissedAttribute(attributeName);
            this.attributes[attributeName].unset();
        },

        /**
         * check if attribute was set
         * @param  {string} attributeName
         * @return {Boolean}
         */
        isSet: function (attributeName) {
            this._throwMissedAttribute(attributeName);
            return this.attributes[attributeName].isSet();
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
            return this.getId() === null;
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
                        model.idAttribute.set(id);
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
            return this.ready().then(function () {
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
                return fulfill();
            } else {
                return fulfill().then(function () {
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
         * @return {Promise<Boolean, Model.ValidationError>}
         */
        validate: function () {
            var model = this;
            return model.ready().then(function () {
                return Vow.allResolved(model._attributesAr.map(function (attribute) {
                    return attribute.validate();
                }));
            }).then(function (validationPromises) {
                var errors = [],
                    error;

                validationPromises.forEach(function (validationPromise, index) {
                    var validationResult, error;

                    if (validationPromise.isFulfilled()) {
                        return;
                    }

                    validationResult = validationPromise.valueOf();

                    if (validationResult instanceof Error) {
                        error =  validationResult;
                    } else {
                        error = new Attribute.ValidationError();
                        error.attribute = model._attributesAr[index];

                        if (typeof validationResult === 'string') {
                            error.message = validationResult;
                        } else if (typeof validationResult !== 'boolean') {
                            error.data = validationResult;
                        }
                    }

                    errors.push(error);
                });

                if (errors.length) {
                    error = new model.__self.ValidationError();
                    error.attributes = errors;
                    return Vow.reject(error);
                } else {
                    return fulfill(true);
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
         * @return {boolean}
         */
        commit: function (branch) {
            var model = this,
                eventString,
                changed = false;

            Object.keys(this.attributes).forEach(function (name) {
                changed = model.attributes[name].commit(branch) || changed;
            });

            if (changed) {
                eventString = (branch ? branch + ':' : '') + 'commit';
                this.trigger(eventString);
            }

            return changed;
        },

        /**
         * @param {string} [branch=DEFAULT_BRANCH]
         * @returns {Object}
         */
        getLastCommitted: function (branch) {
            return this._getSerializedData('getLastCommitted', branch);
        },

        /**
         * @param {String} [attr] - if not defined returns all attributes
         * @returns {*}
         */
        previous: function (attr) {
            if (arguments.length) {
                return this.attributes[attr].previous();
            } else {
                return this._getSerializedData('previous');
            }
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
            return this._getSerializedData('toJSON');
        },

        /**
         * if all calculations are done
         * @return {Boolean}
         */
        isReady: function () {
            return this._ready;
        },

        /**
         * wait for all calculations to be done
         * @return {Promise}
         */
        ready: function () {
            return this._readyPromise;
        },

        /**
         * make all calculations for attributes
         * @return {Promise}
         */
        calculate: function () {
            var model = this;
            if (this.isReady()) {
                this._ready = false;
                this.trigger('calculate');
                //start _calculate on next tick
                this._readyPromise = fulfill().then(function () {
                    return model._calculate();
                });
                this._readyPromise.fail(function () {
                    model._ready = true;
                }).done();
            } else {
                this._requireMoreCalculations = true;
            }
            if (this.throwCalculationErrors) {
                return this._readyPromise;
            } else {
                return this._readyPromise.always(function () {
                    return fulfill();
                });
            }

        },

        /**
         * @returns {Model}
         */
        trigger: function () {
            var args = Array.prototype.slice.call(arguments, 0);
            args.splice(1, 0, this);
            return this.__base.apply(this, args);
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

            this._requireMoreCalculations = false;
            this._ready = false;

            if (n >= model.maxCalculations) {
                return model._throwCalculationLoop();
            }

            this._requireMoreCalculations = false;

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
                model._setCalculatedData(calculateData);
                if (model._checkContinueCalculations()) {
                    return model._calculate(++n);
                } else {
                    model._triggerEvents();
                    //some event habdler could change some attribute
                    if (model._checkContinueCalculations()) {
                        return model._calculate(++n);
                    }
                }
                model._ready = true;
            });
        },

        /**
         * setting calculated data only if nothing have changed during calculations
         * otherwise we will have racing conditions(
         * @param {object} calculateData
         */
        _setCalculatedData: function (calculateData) {
            if (!this._checkContinueCalculations()) {
                this.set(calculateData);
            }
        },

        _checkContinueCalculations: function () {
            return this.isChanged(this.CALCULATIONS_BRANCH) || this._requireMoreCalculations;
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
                return fulfill();
            }
        },

        _throwMissedAttribute: function (attributeName) {
            if (!this.attributes[attributeName]) {
                throw new Error('Unknown attribute ' + attributeName);
            }
        },

        /**
         * @param {('toJSON'|'getLastCommitted'|'previous')} serializeMethod
         * @param {...*} [args]
         * @returns {Object}
         */
        _getSerializedData: function (serializeMethod) {
            var model = this,
                args = Array.prototype.slice.call(arguments, 1);

            return Object.keys(this.attributes).filter(function (name) {
                return !model.attributes[name].internal;
            }).reduce(function (data, name) {
                var attribute = model.attributes[name];
                data[name] = attribute[serializeMethod].apply(attribute, args);
                return data;
            }, {});
        }

    }, {

        /**
         * @override
         */
        inherit: function (props, staticProps) {
            staticProps = staticProps || {};
            staticProps.attributes = staticProps.attributes || props.attributes;
            staticProps.storage = staticProps.storage || props.storage;
            return this.__base(props, staticProps);
        },

        /**
         * @class
         * @abstract
         */
        Storage: require('./storage'),

        attributeTypes: {
            Id: IdAttribute,
            String: require('./types/string'),
            Number: require('./types/number'),
            Boolean: require('./types/boolean'),
            List: require('./types/list'),
            Model: require('./types/model'),
            ModelsList: require('./types/models-list'),
            Collection: require('./types/collection'),
            Object: require('./types/object')
        },

        /**
         * @type {Attribute}
         * @prop {*} [initValue]
         */
        Attribute: require('./attribute'),

        Collection: require('./collection'),

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
            ValidationError.prototype = Object.create(Error.prototype);
            ValidationError.prototype.constructor = ValidationError;
            return ValidationError;
        }())

    });

module.exports = Model;
