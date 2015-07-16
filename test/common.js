var expect = require('chai').expect,
    Model = require('../lib/model');

describe('Common', function () {
    describe('Create', function () {
        describe('with init data', function () {
            var ModelClass = require('./models/simple'),
                model;
            beforeEach(function () {
                model = new ModelClass({
                    a: 'a1'
                });
            });
            it('should get init values', function () {
                expect(model.get('a')).to.be.equal('a1');
            });
            it('should not set undefined values', function () {
                var model = new ModelClass({
                    a: undefined,
                    b: 'b-1'
                });
                expect(model.get('a')).to.be.equal('a');
            });
        });
    });

    describe('Inherit', function () {
        var ModelClass = require('./models/simple'),
        InheritedClass = ModelClass.inherit({
            propB: 'propB'
        });

        describe('ModelClass', function () {
            it('should have inherit', function () {
                expect(ModelClass.inherit).to.be.a('function');
            });
            it('should have attributes', function () {
                var model = new ModelClass();
                expect(model).to.have.property('attributes');
            });
        });

        describe('InheritedClass', function () {
            var model = new InheritedClass();
            it('should have attributes', function () {
                expect(model).to.have.property('attributes');
            });
            it('should have propA', function () {
                expect(model).to.have.property('propA');
            });
            it('should have propB', function () {
                expect(model).to.have.property('propB');
            });
        });
    });

    describe('Get', function () {
        var ModelClass = require('./models/simple'),
            model = new ModelClass();

        it('should resturn default value', function () {
            expect(model.get('a')).to.be.equal('a');
        });
        it('should throw on unknown attribute', function () {
            expect(function () {
                model.get('nonexist');
            }).to.throw(Error);
        });
    });

    describe('Set', function () {
        var ModelClass = require('./models/simple'),
            model;

        beforeEach(function () {
            model = new ModelClass();
        });

        it('should set value', function () {
            model.set('a', 'a2');
            expect(model.get('a')).to.be.equal('a2');
        });
        it('should set hash', function () {
            model.set({
                a: 'a3',
                b: 'b3',
                unknown: 'unknown'
            });
            expect(model.get('a')).to.be.equal('a3');
            expect(model.get('b')).to.be.equal('b3');
            expect(function () {
                model.get('unknown');
            }).to.throw(Error);
        });
        it('should not set undefined fields', function () {
            model.set({
                a: undefined,
                b: 'b-1'
            });
            expect(model.get('a')).to.be.equal('a');
        });
    });

    describe('toJSON', function () {
        var ModelClass = require('./models/simple');

        it('should return data', function () {
            var data = {
                a: 'aData',
                b: 'bData'
            },
            model = new ModelClass(data);
            expect(model.toJSON()).to.have.property('a', 'aData');
            expect(model.toJSON()).to.have.property('b', 'bData');
        });

        it('should support internal', function () {
            var model = new ModelClass();
            expect(model.toJSON()).to.have.not.property('c');
        });

        it('should return serializable value NaN', function () {
            var ModelsWithNumbers = Model.inherit({
                attributes: {
                    n: Model.attributeTypes.Number
                }
            }),
            model1 = new ModelsWithNumbers(),
            model2 = new ModelsWithNumbers(
                JSON.parse(
                    JSON.stringify(
                        model1.toJSON()
                    )
                )
            );

            expect(isNaN(model2.get('n'))).to.be.equal(true);
        });
        it('should return serializable value Infinity', function () {
            var ModelsWithNumbers = Model.inherit({
                attributes: {
                    n: Model.attributeTypes.Number
                }
            }),
            model1 = new ModelsWithNumbers({
                n: -Infinity
            }),
            model2 = new ModelsWithNumbers(
                JSON.parse(
                    JSON.stringify(
                        model1.toJSON()
                    )
                )
            );

            expect(model2.get('n')).to.be.equal(-Infinity);
        });
    });

    describe('Parse', function () {
        var ModelClass = require('./models/with-calculations');
        it('should work for set and get', function () {
            var model = new ModelClass();
            model.set('preprocessed', {
                a: 'a',
                b: 'b'
            });
            expect(model.get('preprocessed')).to.be.a('string');
            expect(JSON.parse(model.get('preprocessed'))).to.have.property('b', 'b');
        });
    });
});
