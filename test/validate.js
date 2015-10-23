
var expect = require('chai').expect,
    Attribute = require('../lib/attribute'),
    ModelAttribute = require('../lib/types/model'),
    CollectionAttribute = require('../lib/types/collection'),
    Vow = require('vow');

describe('Validate', function () {
    var ModelClass = require('./models/simple'),
        model;
    beforeEach(function () {
        model = new ModelClass({
            a: 'a1'
        });
    });
    it('should fulfill for valid model', function () {
        return model.validate();
    });
    it('should reject for invalid attributes with async and sync validation', function () {
        model.set('withSyncValidation', 'notValid');
        return model.validate().always(function (p) {
            if (p.isFulfilled()) {
                return Vow.reject();
            } else {
                return Vow.fulfill();
            }
        }).then(function () {
            model.revert();
            return model.validate();
        }).then(function () {
            model.set('withAsyncValidation', 'notValid');
            return model.validate();
        }).always(function (p) {
            if (p.isFulfilled()) {
                return Vow.reject();
            } else {
                return Vow.fulfill();
            }
        });
    });
    it('should report invalid attributes', function () {
        model.set({
            withAsyncValidation: 'notValid',
            withSyncValidation: 'notValid'
        });
        return model.validate().always(function (p) {
            var error;
            if (p.isFulfilled()) {
                return Vow.reject();
            } else {
                error = p.valueOf();
                expect(error).to.be.instanceOf(Error);
                expect(error).to.be.instanceOf(ModelClass.ValidationError);
                expect(error).to.have.property('attributes');
                expect(error).to.have.deep.property('attributes[0].name');
                expect(error).to.have.deep.property('attributes[1].name');
                expect(error.attributes[0]).to.be.instanceOf(Attribute.ValidationError);
            }
        });
    });

    it('should set error message if getValidationError returns string', function () {
        model.set({
            withSyncValidationMessage: 'notValid'
        });
        return model.validate().always(function (p) {
            var error;
            if (p.isFulfilled()) {
                return Vow.reject();
            } else {
                error = p.valueOf();
                expect(error.attributes[0]).to.be.instanceOf(Attribute.ValidationError);
                expect(error.attributes[0].message).to.be.equal('invalid');
            }
        });
    });

    it('should set data to error if getValidationError returns any besides string or boolean', function () {
        model.set({
            withSyncValidationData: 'notValid'
        });
        return model.validate().always(function (p) {
            var error;
            if (p.isFulfilled()) {
                return Vow.reject();
            } else {
                error = p.valueOf();
                expect(error.attributes[0]).to.be.instanceOf(Attribute.ValidationError);
                expect(error.attributes[0].data).to.be.deep.equal({data: 'data'});
            }
        });
    });

    describe('with nested entities', function () {
        var model,
            ModelClass = require('./models/with-nested');

        beforeEach(function () {
            model = new ModelClass({
                a: 'a1',
                nested: {
                    invalid: true
                }
            });
        });

        it('should report invalid nested model attribute with specific error', function () {

            model.get('nested').set('invalid', false);

            return model.validate().always(function (p) {
                var error;

                if (p.isFulfilled()) {
                    return Vow.reject();
                } else {
                    error = p.valueOf();
                    expect(error).to.be.instanceOf(Error);
                    expect(error).to.be.instanceOf(ModelClass.ValidationError);
                    expect(error.attributes[0]).to.be.instanceOf(ModelAttribute.ValidationError);
                    expect(error.attributes[0].modelError).to.be.instanceOf(ModelClass.ValidationError);
                }
            });
        });

        it('should report invalid nested collection attribute with specific error', function () {

            model.get('nestedCollection').set([
                {invalid: false},
                {invalid: true},
                {invalid: false}
            ]);

            return model.validate().always(function (p) {
                var error;

                if (p.isFullfiled) {
                    return Vow.reject();
                } else {
                    error = p.valueOf();
                    expect(error).to.be.instanceOf(Error);
                    expect(error).to.be.instanceOf(ModelClass.ValidationError);
                    expect(error.attributes[0]).to.be.instanceOf(CollectionAttribute.ValidationError);
                    expect(error.attributes[0].modelsErrors).to.be.an('array');
                    expect(error.attributes[0].modelsErrors.length).to.be.equal(2);
                    expect(error.attributes[0].modelsErrors[0]).to.be.instanceOf(ModelClass.ValidationError);
                    expect(error.attributes[0].modelsErrors[0].index).to.be.equal(0);
                    expect(error.attributes[0].modelsErrors[1]).to.be.instanceOf(ModelClass.ValidationError);
                    expect(error.attributes[0].modelsErrors[1].index).to.be.equal(2);
                }
            });
        });

    });
});
