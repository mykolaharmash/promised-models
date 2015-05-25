
var expect = require('chai').expect,
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
            if (p.isFullfiled) {
                return Vow.reject();
            } else {
                return Vow.fulfill();
            }
        }).then(function () {
            model.revert();
            return model.validate();
        }).then(function () {
            model.set('withAsyncValidation', 'notValid');
        }).always(function (p) {
            if (p.isFullfiled) {
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
            if (p.isFullfiled) {
                return Vow.reject();
            } else {
                expect(p.valueOf()).to.be.instanceOf(Error);
                expect(p.valueOf()).to.be.instanceOf(ModelClass.ValidationError);
                expect(p.valueOf()).to.have.property('attributes');
                expect(p.valueOf()).to.have.deep.property('attributes[0].name');
                expect(p.valueOf()).to.have.deep.property('attributes[1].name');
            }
        });
    });
});
