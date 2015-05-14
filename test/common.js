var expect = require('chai').expect;

describe('Models create', function () {
    describe('with init data', function () {
        var ModelClass = require('./models/simple'),
            model = new ModelClass({
                a: 'a1'
            });
        it('should get init values', function () {
            expect(model.get('a')).to.be.equal('a1');
        });
    });
});

describe('Models.inherit', function () {
    var ModelClass = require('./models/simple'),
    InheritedClass = ModelClass.inherit({
        propB: 'propB'
    });

    describe('ModelClass', function () {
        it('should have inherit', function () {
            expect(ModelClass.inherit).to.be.a('function');
        });
        it('should have fields', function () {
            var model = new ModelClass();
            expect(model).to.have.property('fields');
        });
    });

    describe('InheritedClass', function () {
        var model = new InheritedClass();
        it('should have fields', function () {
            expect(model).to.have.property('fields');
        });
        it('should have propA', function () {
            expect(model).to.have.property('propA');
        });
        it('should have propB', function () {
            expect(model).to.have.property('propB');
        });
    });
});

describe('Models.get', function () {
    var ModelClass = require('./models/simple'),
        model = new ModelClass();

    it('should exist', function () {
        expect(model.get).to.be.a('function');
    });
    it('should resturn default value', function () {
        expect(model.get('a')).to.be.equal('a');
    });
    it('should throw on unknown field', function () {
        expect(function () {
            model.get('nonexist');
        }).to.throw(Error);
    });
});
