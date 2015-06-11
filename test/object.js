var expect = require('chai').expect,
    Model = require('../lib/model');

describe('Object attribute', function () {
    var ModelClass;
    before(function () {
        ModelClass = Model.inherit({
            attributes: {
                object: Model.attributeTypes.Object
            }
        });
    });
    describe('model', function () {
        var model;
        beforeEach(function () {
            model = new ModelClass({
                object: {
                    a: 'a-0'
                }
            });
        });
        it('should be inited', function () {
            expect(model instanceof ModelClass);
        });
        it('should get initial object', function () {
            expect(model.get('object')).to.be.deep.equal({
                a: 'a-0'
            });
        });
        it('should set object', function () {
            model.set('object', {
                a: 'a-1'
            });
            expect(model.get('object')).to.be.deep.equal({
                a: 'a-1'
            });
        });
        it('should get shalow copy', function () {
            model.get('object').a = 'a-1';
            expect(model.get('object')).to.be.deep.equal({
                a: 'a-0'
            });
        });
        it('should set array', function () {
            model.set('object', [{a: 'a-0'}]);
            expect(model.get('object')).to.be.deep.equal([{
                a: 'a-0'
            }]);
        });
        it('should set null', function () {
            model.set('object', null);
            expect(model.get('object')).to.be.equal(null);
        });
    });
});