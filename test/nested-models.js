var expect = require('chai').expect;

describe('Nested models', function () {
    var ModelWithNested = require('./models/with-nested'),
        Model = require('../lib/model');
    describe('model attribute', function () {
        var data, model;
        beforeEach(function () {
            data = {
                nested: {
                    a: 'a-0',
                    b: 'b-0',
                    invalid: 0
                }
            };
            model = new ModelWithNested(data);
            return model.ready();
        });
        it('should serialize to toJSON', function () {
            expect(model.toJSON().nested).to.be.deep.equal(data.nested);
        });
        describe('change', function () {
            it('should be triggered on parent model', function (done) {
                model.on('change', function () {
                    done();
                });
                model.get('nested').set('a', 'a-1');
            });
            describe(':attribute', function () {
                it('should triggered on parent model', function (done) {
                    model.on('change:nested', function () {
                        done();
                    });
                    model.get('nested').set('a', 'a-1');
                });
            });
            it('should be triggered on parent after replacement of nested model', function (done) {
                var Nested = Model.inherit({
                        attributes: {
                            a: Model.attributeTypes.String.inherit({
                                default: 'a0'
                            })
                        }
                    }),
                    Parent = Model.inherit({
                        attributes: {
                            nested: Model.attributeTypes.Model(Nested),
                            aNested: Model.attributeTypes.String.inherit({
                                calculate: function () {
                                    return this.model.get('nested').get('a');
                                }
                            })
                        }
                    }),
                    parent = new Parent(), nested = new Nested({
                        a: 'a1'
                    });
                parent.ready().then(function () {
                    parent.set('nested', nested);
                    return parent.ready();
                }).then(function () {
                    parent.on('change', function () {
                        expect(parent.get('aNested')).to.be.equal('a2');
                        done();
                    });
                    parent.get('nested').set('a', 'a2');
                }).done();
            });

        });
        it('should validate', function (done) {
            model.validate().fail(function () {
                model.get('nested').set('invalid', 1);
                return model.validate().then(function () {
                    done();
                });
            }).done();
        });
        it('isChanged should be false after set same instance', function () {
            model.set('nested', model.get('nested'));
            return model.ready().then(function () {
                expect(model.isChanged()).to.be.equal(false);
            }).done();
        });
        it('isChanged should be true if nested changed', function () {
            model.get('nested').set('a', 'a-1');
            expect(model.isChanged()).to.be.equal(true);
        });
        it('isChanged should be false after revert', function () {
            model.get('nested').set('a', 'a-1');
            model.revert();
            expect(model.isChanged()).to.be.equal(false);
        });
        it('isChanged should be false after commit', function () {
            model.get('nested').set('a', 'a-1');
            model.commit();
            expect(model.isChanged()).to.be.equal(false);
        });
        it('ready should work for nested models', function () {
            model.get('nestedAsync').set('a', 'a-1');
            expect(model.isReady()).to.be.equal(false);
            return model.ready().then(function () {
                expect(model.isReady()).to.be.equal(true);
                expect(model.get('nestedAsync').get('asyncDepended')).to.be.equal('a-1-b-1-c-1-async');
            });
        });
        describe('revert', function () {
            it('should revert nested model', function () {
                model.get('nested').set('a', 'a-1');
                model.revert();
                expect(model.get('nested').get('a')).to.be.equal('a-0');
            });
        });
        describe('commit', function () {
            it('should cache model state', function () {
                model.get('nested').set('a', 'a-1');
                model.commit();
                model.revert();
                expect(model.get('nested').get('a')).to.be.equal('a-1');
            });
        });
    });
});
