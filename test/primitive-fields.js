var expect = require('chai').expect;

describe('Primitive attribute types', function () {
    var Model = require('./models/with-types');
    describe('string', function () {
        it('should be string', function () {
            var model = new Model();
            expect(model.get('string')).to.be.a('string');
            expect(model.get('string')).to.be.equal('');
        });
        it('should be parsed as a string', function () {
            var model = new Model();
            model.set('string', true);
            expect(model.get('string')).to.be.a('string');
        });
    });
    describe('number', function () {
        it('should be number', function () {
            var model = new Model();
            expect(model.get('number')).to.be.a('number');
            expect(isNaN(model.get('number'))).to.be.equal(true);
        });
        it('isChanged for NaN should be false', function () {
            var model = new Model();
            expect(model.isChanged()).to.be.equal(false);
        });
        it('should be parsed as a number', function () {
            var model = new Model();
            model.set('number', true);
            expect(model.get('number')).to.be.a('number');
            model.set('number', false);
            expect(model.get('number')).to.be.a('number');
            model.set('number', 'test');
            expect(model.get('number')).to.be.a('number');
            model.set('number', '5');
            expect(model.get('number')).to.be.equal(5);
        });
    });
    describe('boolean', function () {
        it('should be boolean', function () {
            var model = new Model();
            expect(model.get('boolean')).to.be.a('boolean');
            expect(model.get('boolean')).to.be.equal(false);
        });
        it('should be parsed as a boolean', function () {
            var model = new Model();
            model.set('boolean', 1);
            expect(model.get('boolean')).to.be.a('boolean');
            model.set('boolean', '');
            expect(model.get('boolean')).to.be.equal(false);
        });
    });

    describe('isEqual', function () {
        it('should work for primitive types', function (done) {
            var model = new Model({
                string: '5',
                number: 5,
                boolean: true
            });
            model.on('change', function () {
                done();
            });
            model.ready().then(function () {
                model.set(model.toJSON());
                return model.ready();
            }).then(function () {
                model.set({
                    string: 5,
                    number: '5',
                    boolean: 5
                });
                return model.ready();
            }).then(function () {
                model.set({
                    string: '',
                    number: '0',
                    boolean: 0
                });
            }).done();
        });
    });
});
