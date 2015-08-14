var expect = require('chai').expect,
    Model = require('../lib/model');

describe('attribute initial state', function () {
    var ModelClass, NestedClass;
    before(function () {
        NestedClass = Model.inherit({
            attributes: {
                a: Model.attributeTypes.String.inherit({
                    default: 'a'
                })
            }
        });
        ModelClass = Model.inherit({
            attributes: {
                a: Model.attributeTypes.String.inherit({
                    default: 'a'
                }),
                nested: Model.attributeTypes.Model(NestedClass),
                collection: Model.attributeTypes.ModelsList(NestedClass)
            }
        });
    });
    describe('isSet', function () {
        it('should be false if attribute was not set', function () {
            var model = new ModelClass();
            expect(model.isSet('a')).to.be.equal(false);
        });
        it('should be false if attribute was initialized with null value', function () {
            var model = new ModelClass({a: null});
            expect(model.isSet('a')).to.be.equal(false);
        });
        it('should be true if attribute was set when inited', function () {
            var model = new ModelClass({
                a: 'a'
            });
            expect(model.isSet('a')).to.be.equal(true);
        });
        it('should be true if attribute was set', function () {
            var model = new ModelClass();
            model.set('a', true);
            expect(model.isSet('a')).to.be.equal(true);
        });
        it('should be false after set and revert', function () {
            var model = new ModelClass();
            model.set('a', true);
            model.revert();
            expect(model.isSet('a')).to.be.equal(false);
        });
        it('should be true after set, commit and revert', function () {
            var model = new ModelClass();
            model.set('a', true);
            model.revert();
            expect(model.isSet('a')).to.be.equal(false);
        });
    });
    describe('unset', function () {
        it('should change value to default', function () {
            var model = new ModelClass({
                a: 'a-1'
            });
            model.unset('a');
            expect(model.get('a')).to.be.equal('a');
        });
        it('should make isSet to be false', function () {
            var model = new ModelClass({
                a: 'a-1'
            });
            model.unset('a');
            expect(model.isSet('a')).to.be.equal(false);
        });
        it('should emit change', function (done) {
            var model = new ModelClass({
                a: 'a-1'
            });
            model.ready().then(function () {
                model.on('change:a', function () {
                    done();
                });
                model.unset('a');
            }).done();
        });
    });
    describe('set', function () {
        it('should unset when setting null', function () {
            var model = new ModelClass({
                a: 'a-1'
            });
            model.set('a', null);
            expect(model.get('a')).to.be.equal('a');
        });
    });
});
